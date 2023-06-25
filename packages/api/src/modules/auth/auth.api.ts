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
      method: 'POST',
      path: '/auth/resendEmail',
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
      method: 'POST',
      path: '/auth/changePassword',
      protect: true,
      tags: ['Auth'],
    },
  },
} satisfies ProcedureStructure;
