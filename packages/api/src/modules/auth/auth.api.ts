import { z } from 'zod';
import type { ProcedureStructure } from '../../api.types';
import { outputSchema } from '../../backend/response';

const authResponse = outputSchema(
  z.object({
    session: z.string(),
    verified: z.boolean(),
    sub: z.string(),
  })
);

export const auth = {
  validateEmail: {
    input: z.object({
      nonce: z.string(),
    }),
    output: authResponse.error({
      code: '401',
      message: 'Invalid nonce.',
    }),
    openapi: {
      method: 'POST',
      path: '/auth/validateEmail',
      description:
        'This will validate the email an user had entered. The required nonce will be contained in the email and the frontend will hit this route with the nonce when clicked.',
      protect: false,
      tags: ['Auth'],
    },
  },
  resendEmail: {
    input: z.void(),
    output: outputSchema(z.void()).error({
      code: '400',
      message: 'Please use social sign in.',
    }),
    openapi: {
      method: 'GET',
      path: '/auth/resendEmail',
      description: 'This will resend the validation email for login user.',
      protect: true,
      tags: ['Auth'],
    },
  },
  loginOrSignup: {
    input: z.object({
      auth0Token: z.string(),
    }),
    output: authResponse,
    openapi: {
      method: 'POST',
      path: '/auth/loginOrSignup',
      description:
        'The will register user or log user in. Use auth0 jwt to exchange the app jwt.',
      protect: false,
      tags: ['Auth'],
    },
  },
  logout: {
    input: z.void(),
    output: outputSchema(z.void()),
    openapi: {
      method: 'POST',
      path: '/auth/logout',
      protect: true,
      tags: ['Auth'],
      description:
        'This will clear the cookie that contains app jwt and invalidate all sessions created by this jwt',
    },
  },
  startSession: {
    input: z.void(),
    output: authResponse.error({
      code: '401',
      message: 'Unauthorized',
    }),
    openapi: {
      method: 'POST',
      path: '/auth/startSession',
      protect: false,
      tags: ['Auth'],
      description:
        'Use app jwt cookie to start a new session. Will return the session id.',
    },
  },
  changePassword: {
    input: z.object({
      oldPassword: z.string(),
      newPassword: z
        .string()
        .nonempty()
        .min(8)
        .regex(/(?=.*[A-Z])/)
        .regex(/(?=.*[a-z])/)
        .regex(/(?=.*\d)/)
        .regex(/(?=.*\W)/),
    }),
    output: outputSchema(z.void())
      .error({
        code: '400',
        message:
          'Users who are not registered with password method have no password to change.',
      })
      .error({
        code: '403',
        message: 'Incorrect Password.',
      }),
    openapi: {
      method: 'PATCH',
      path: '/auth/changePassword',
      protect: true,
      tags: ['Auth'],
      description:
        'Change user password with old password. Only for users using email to sign up.',
    },
  },
} satisfies ProcedureStructure;
