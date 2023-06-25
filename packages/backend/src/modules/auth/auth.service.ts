import axios from 'axios';
import { randomUUID } from 'node:crypto';
import { TRPCError } from '@trpc/server';
import { createVerifier, createDecoder, createSigner } from 'fast-jwt';
import sendgrid from '@sendgrid/mail';
import dayjs from 'dayjs';

import {
  auth0JwtSchema,
  auth0SecretSchema,
  appJwtSchema,
  auth0PostTokenResponseSchema,
} from './auth.schema';
import { Context } from '../../trpc/context';

const decodeJwt = createDecoder({ complete: true, checkTyp: 'JWT' });

export const verifyAndExtractAuth0TokenData = async (
  auth0Token: string,
  { env, logger }: Context
) => {
  logger.trace({ auth0Token }, 'Starting to verify Auth0 token.');
  const decoded: unknown = decodeJwt(auth0Token);
  logger.trace(decoded, 'Decoded json web token.');
  const jwtResult = auth0JwtSchema.safeParse(decoded);
  if (!jwtResult.success) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid auth0 token.',
      cause: jwtResult.error,
    });
  }

  /* Get Secret From Auth0 */
  const auth0Url = `https://${env.auth0AuthDomain}/.well-known/jwks.json`;
  logger.trace({ auth0Url }, 'Starting to get secret from Auth0.');
  const { data } = await axios
    .get<unknown>(`https://${env.auth0AuthDomain}/.well-known/jwks.json`)
    .catch((err: unknown) => {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to fetch secret key from auth0.',
        cause: err,
      });
    });
  logger.trace(data, 'Auth0 response.');
  const auth0SecretResponse = auth0SecretSchema.safeParse(data);
  if (!auth0SecretResponse.success) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Auth0 responded with unexpected data.',
      cause: auth0SecretResponse.error,
    });
  }
  logger.trace(jwtResult.data);
  const {
    header: { kid, alg },
    payload: { sub, email, name },
  } = jwtResult.data;
  const key = auth0SecretResponse.data.keys.find(
    (k) => k.alg === alg && k.kid === kid
  );
  if (!key || !key.x5c[0]) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No correct key found in the response of Auth0.',
      cause: key,
    });
  }
  const secret = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----\n`;
  const auth0Verify = createVerifier({ key: secret });
  try {
    auth0Verify(auth0Token);
  } catch (err) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      cause: err,
    });
  }
  logger.trace({ sub, email, name }, 'Successfully verified token as sub.');
  return { sub, email, name };
};

export const verifyAuth0Password = async (
  { email, password }: { email: string | null; password: string },
  { logger, env }: Context
) => {
  try {
    const { data } = await axios.post(
      `https://${env.auth0AuthDomain}/oauth/token`,
      {
        grant_type: 'password',
        username: email,
        password,
        audience: env.auth0AuthClientAudience,
        client_id: env.auth0AuthClientId,
      }
    );
    const parseResult = auth0PostTokenResponseSchema.safeParse(data);
    if (!parseResult.success) {
      const message = 'Unexpected results from Auth0 when verifying password.';
      logger.error(parseResult.error, message);
      throw new TRPCError({
        message,
        code: 'INTERNAL_SERVER_ERROR',
        cause: parseResult.error,
      });
    }
  } catch (err) {
    const message = 'Unable to verify password from Auth0.';
    logger.error(err, message);
    throw new TRPCError({
      message,
      code: 'FORBIDDEN',
      cause: err,
    });
  }
};

export const getAuth0ManagementToken = async ({ logger, env }: Context) => {
  try {
    const { data } = await axios.post(
      `https://${env.auth0ManagementDomain}/oauth/token`,
      {
        client_id: env.auth0ManagementClientId,
        client_secret: env.auth0ManagementClientSecret,
        audience: env.auth0ManagementAudience,
        grant_type: 'client_credentials',
      }
    );
    const parseResult = auth0PostTokenResponseSchema.safeParse(data);
    if (!parseResult.success) {
      const message =
        'Unexpected response from Auth0 when requesting auth0 management token.';
      logger.error(parseResult.error, message);
      throw new TRPCError({
        message,
        code: 'INTERNAL_SERVER_ERROR',
        cause: parseResult.error,
      });
    }
    return parseResult.data.access_token;
  } catch (err) {
    const message =
      'Unexpected error from Auth0 when requesting auth0 management token.';
    logger.error(err, message);
    throw new TRPCError({
      message,
      code: 'INTERNAL_SERVER_ERROR',
      cause: err,
    });
  }
};

export const setNewAuth0Password = async (
  {
    sub,
    password,
  }: {
    sub: string;
    password: string;
  },
  ctx: Context
) => {
  const { env, logger } = ctx;
  const auth0Token = await getAuth0ManagementToken(ctx);
  try {
    const { data } = await axios.patch(
      `https://${env.auth0AuthDomain}/api/v2/users/${sub}`,
      {
        password,
        connection: 'Username-Password-Authentication',
      },
      {
        headers: {
          Authorization: `Bearer ${auth0Token}`,
        },
      }
    );
    logger.trace(data, 'Successfully reset Auth0 password.');
  } catch (err) {
    const message = 'Unexpected error from Auth0 when changing Auth0 password.';
    logger.error(err, message);
    throw new TRPCError({
      message,
      code: 'INTERNAL_SERVER_ERROR',
      cause: err,
    });
  }
};

export const setJwtCookie = (
  sub: string,
  { logger, fastifyRes, env }: Context
) => {
  logger.trace({ sub }, 'Starting to create JWT');
  const signSync = createSigner({
    key: env.appJwtSecretKey,
    sub,
    expiresIn: env.appJwtExpireMilliseconds,
  });
  const appJwt = signSync({});
  logger.trace({ appJwt }, 'Successfully create JWT');
  fastifyRes.setCookie('app-auth', appJwt, {
    path: '/',
    sameSite: 'strict',
    secure: true,
    httpOnly: true,
  });
  logger.trace({ appJwt }, 'Successfully setup cookie');
  return appJwt;
};

export const clearJwtCookie = ({ fastifyReq, fastifyRes }: Context) => {
  const jwt = fastifyReq.cookies['app-auth'];
  fastifyRes.clearCookie('app-auth');
  return jwt;
};

export const verifyAndDecodeAppJwt = async (
  appJwt: string,
  { logger }: Context
) => {
  logger.trace({ appJwt }, 'Starting to decode appJwt');
  const decoded: unknown = decodeJwt(appJwt);
  logger.trace({ decoded }, 'Decoded app JWT.');
  const jwtResult = appJwtSchema.safeParse(decoded);
  if (!jwtResult.success) {
    const errorMsg = 'Invalid app json web token.';
    logger.error({ jwtResult }, errorMsg);
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: errorMsg,
      cause: jwtResult.error,
    });
  }
  return jwtResult.data.payload;
};

export const getUserBySub = async (
  sub: string,
  { logger, prisma }: Context
) => {
  logger.trace({ sub }, 'Starting to use sub to find user.');
  /* Search Existing User */
  const user = await prisma.user.findFirst({
    where: {
      sub,
    },
  });
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }
  return user;
};

export const startUserSessionByAppJwt = async (
  {
    sub,
    remainingExpireInMilliSeconds,
    appJwt,
  }: { sub: string; remainingExpireInMilliSeconds: number; appJwt: string },
  { logger, prisma }: Context
) => {
  logger.trace({ sub }, 'Starting to create session for user');
  const session = await prisma.session.create({
    data: {
      expiredAt: dayjs()
        .add(remainingExpireInMilliSeconds, 'milliseconds')
        .toDate(),
      jwt: appJwt,
      active: true,
      user: {
        connect: {
          sub,
        },
      },
    },
  });
  logger.trace(session, 'Successfully set nonce for user');
  return session.id;
};

export const clearSessionsByJwt = async (
  jwt: string | undefined,
  { prisma, logger }: Context
) => {
  logger.trace({ jwt }, 'Started to clear sessions for jwt');
  const { count } = await prisma.session.updateMany({
    where: {
      jwt,
    },
    data: {
      active: false,
    },
  });
  logger.trace({ jwt, count }, 'Successfully clear sessions for jwt');
};

export const sendVerificationEmail = async (
  data: {
    to: string;
    sub: string;
    emailNonce: string | null;
    emailNonceExpiredAt: Date | null;
  },
  { prisma, logger, env }: Context
) => {
  logger.trace(data, 'Starting to send verification email');
  const { to, sub, emailNonce, emailNonceExpiredAt } = data;

  /* Because the same email A.C. */
  let nonce = '';
  if (emailNonceExpiredAt && emailNonceExpiredAt > new Date() && emailNonce) {
    nonce = emailNonce;
  } else {
    nonce = randomUUID();
    await prisma.user.update({
      where: {
        sub,
      },
      data: {
        emailNonce: nonce,
        emailNonceExpiredAt: dayjs().add(900, 'seconds').toDate(),
      },
    });
  }
  logger.trace({ nonce }, 'Successfully set nonce to database.');

  sendgrid.setApiKey(env.sendgridApiKey);
  const [sendgridRes] = await sendgrid.send({
    from: 'no-reply@get-aha-job.site',
    to,
    subject: 'Email Verification',
    text: `Please use the following link to verify your email and login. ${env.frontendUrl}/verify-email#${nonce}`,
  });
  if (sendgridRes.statusCode !== 202) {
    const errorMsg = `Unable to send verification email to ${to}.`;
    logger.error(sendgridRes, errorMsg);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: errorMsg,
    });
  }
  logger.trace(data, `Successfully sent verification email.`);
};
