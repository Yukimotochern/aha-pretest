import { TrpcRouterConformToApi, trpcRouterBuilderStructure } from '@aha/api';

import { privateProcedure, publicProcedure, router } from '../../trpc/trpc';
import {
  verifyAndExtractAuth0TokenData,
  sendVerificationEmail,
  startUserSessionByAppJwt,
  getUserBySub,
  verifyAndDecodeAppJwt,
  setJwtCookie,
  clearJwtCookie,
  clearSessionsByJwt,
  verifyAuth0Password,
  setNewAuth0Password,
} from './auth.service';
import { TRPCError } from '@trpc/server';

const {
  auth: {
    validateEmailApi,
    resendEmailApi,
    loginOrSignupApi,
    logoutApi,
    startSessionApi,
    changePasswordApi,
  },
} = trpcRouterBuilderStructure;

export const authProcedures = router({
  validateEmail: validateEmailApi(publicProcedure).mutation(
    async ({ input: { nonce }, ctx }) => {
      const { res, prisma, env, logger } = ctx;
      /* Validate Nonce and Get User Info */
      logger.info(
        {
          nonce,
        },
        'Receive nonce.'
      );
      const now = new Date();
      const userWithNonce = await prisma.user.findFirst({
        where: {
          emailNonce: nonce,
          emailNonceExpiredAt: {
            gte: now,
          },
        },
      });
      if (!userWithNonce) {
        logger.error({ nonce, now }, 'No valid nonce found.');
        return res.error({
          code: '401',
          message: 'Invalid nonce.',
        });
      }
      logger.trace(
        {
          userWithNonce,
        },
        'Get user with valid nonce.'
      );
      const { sub } = userWithNonce;
      const user = await prisma.user.update({
        where: {
          sub,
        },
        data: {
          verified: true,
          loginTimes: {
            increment: 1,
          },
          emailNonce: null,
          emailNonceExpiredAt: null,
        },
      });
      logger.trace(
        { sub },
        'Nonce invalidated, user verified and login times increased successfully.'
      );
      /* Clear Previous Login */
      const prevJwt = clearJwtCookie(ctx);
      await clearSessionsByJwt(prevJwt, ctx);
      /* Set JWT Cookie */
      const appJwt = setJwtCookie(sub, ctx);
      /* Start Session */
      const session = await startUserSessionByAppJwt(
        {
          sub,
          remainingExpireInMilliSeconds: env.appJwtExpireMilliseconds,
          appJwt,
        },
        ctx
      );
      logger.info(
        { user },
        'Successfully verified user email and log user in.'
      );
      return res.ok({
        session,
        verified: user.verified,
        sub,
      });
    }
  ),
  resendEmail: resendEmailApi(privateProcedure).mutation(async ({ ctx }) => {
    const {
      user: { sub, email, emailNonce, emailNonceExpiredAt },
      res,
      logger,
    } = ctx;
    logger.info(
      {
        ...ctx.user,
      },
      'Starting to resend email for user.'
    );
    if (!sub.includes('auth0') || !email) {
      logger.error(
        { sub },
        'Can not send verification email for other auth method.'
      );
      return res.error({
        code: '400',
        message: 'Please use social sign in.',
      });
    }
    await sendVerificationEmail(
      {
        to: email,
        sub,
        emailNonce,
        emailNonceExpiredAt,
      },
      ctx
    );
    logger.info({ sub, email }, 'Email resent successfully.');
    return res.ok();
  }),
  loginOrSignup: loginOrSignupApi(publicProcedure).mutation(
    async ({ input: { auth0Token }, ctx }) => {
      const { res, logger, prisma, env } = ctx;
      logger.info(
        { auth0Token },
        'Starting to login or signup for user with token.'
      );
      /* Clear Previous Login */
      const prevJwt = clearJwtCookie(ctx);
      await clearSessionsByJwt(prevJwt, ctx);

      /* Validate Auth0Token */
      const { sub, email, name } = await verifyAndExtractAuth0TokenData(
        auth0Token,
        ctx
      );

      /* Update Login Times or Create Account */
      logger.trace({ sub }, 'Starting to create user account.');
      const isEmailPasswordMethod = sub.includes('auth0');
      const user = await prisma.user.upsert({
        where: {
          sub,
        },
        create: {
          loginTimes: 1,
          verified: !isEmailPasswordMethod,
          sub,
          email,
          profile: {
            create: {
              name,
            },
          },
        },
        update: {
          loginTimes: {
            increment: 1,
          },
        },
      });
      logger.trace({ user }, 'User successfully created or updated.');
      const { emailNonce, emailNonceExpiredAt } = user;

      /* Send Email if Signing up && Using Email Method */
      if (user.loginTimes === 1 && isEmailPasswordMethod && !!email) {
        await sendVerificationEmail(
          {
            to: email,
            sub,
            emailNonce,
            emailNonceExpiredAt,
          },
          ctx
        );
      }

      /* Set JWT Cookie */
      const appJwt = setJwtCookie(sub, ctx);

      /* Start Session */
      const session = await startUserSessionByAppJwt(
        {
          sub,
          remainingExpireInMilliSeconds: env.appJwtExpireMilliseconds,
          appJwt,
        },
        ctx
      );
      logger.info({ user }, 'Successfully log user in.');

      return res.ok({
        session,
        verified: user.verified,
        sub,
      });
    }
  ),
  logout: logoutApi(privateProcedure).mutation(async ({ ctx }) => {
    const { res, logger, user } = ctx;
    logger.info({ user }, 'Logout user.');
    const jwt = clearJwtCookie(ctx);
    await clearSessionsByJwt(jwt, ctx);
    logger.info({ user }, 'Logout user successfully.');
    return res.ok();
  }),
  startSession: startSessionApi(publicProcedure).mutation(async ({ ctx }) => {
    const { res, fastifyReq, logger } = ctx;
    const appJwt = fastifyReq.cookies['app-auth'];
    logger.info({ appJwt }, 'Start session for jwt.');
    if (!appJwt) {
      logger.error({}, 'No jwt provided.');
      return res.error({
        code: '401',
        message: 'Unauthorized',
      });
    }
    const { sub, exp } = await verifyAndDecodeAppJwt(appJwt, ctx);
    const { verified } = await getUserBySub(sub, ctx);
    const now = Date.now();
    const expireInMilliSeconds = exp * 1000 - now;
    if (expireInMilliSeconds <= 0) {
      logger.error(
        { sub, exp, now, expireInMilliSeconds, appJwt },
        'Jwt expired.'
      );
      return res.error({
        code: '401',
        message: 'Unauthorized',
      });
    }
    const session = await startUserSessionByAppJwt(
      {
        sub,
        remainingExpireInMilliSeconds: expireInMilliSeconds,
        appJwt,
      },
      ctx
    );
    logger.info({ appJwt, sub }, 'Session started for user.');
    return res.ok({
      session,
      verified,
      sub,
    });
  }),
  changePassword: changePasswordApi(privateProcedure).mutation(
    async ({ ctx, input: { oldPassword, newPassword } }) => {
      const {
        res,
        user: { sub },
        logger,
      } = ctx;
      logger.info(
        {
          sub,
        },
        'Change password for user.'
      );
      /* Only Email / Password Method */
      if (!sub.includes('auth0')) {
        logger.info(
          { sub },
          "Can not change password for user that didn't register with email."
        );
        return res.error({
          code: '400',
          message:
            'Users who are not registered with password method have no password to change.',
        });
      }
      /* Get User */
      const user = await getUserBySub(sub, ctx);

      /* Check Old Password */
      try {
        await verifyAuth0Password(
          {
            email: user.email,
            password: oldPassword,
          },
          ctx
        );
      } catch (err) {
        if (err instanceof TRPCError && err.code === 'FORBIDDEN') {
          logger.error({ sub }, 'User unauthorized');
          return res.error({
            code: '403',
            message: 'Incorrect Password.',
          });
        }
      }

      /* Set New Password */
      await setNewAuth0Password({ sub, password: newPassword }, ctx);

      logger.info({ sub }, 'Successfully changed user password.');

      return res.ok();
    }
  ),
}) satisfies TrpcRouterConformToApi['auth'];
