import { z } from 'zod';
import type { ProcedureStructure } from '../../api.types';
import { outputResponseSchema } from '../../backend/response';

export const auth = {
  startSession: {
    input: z.object({
      token: z.string(),
      isRedirect: z.boolean(),
      sub: z.string(),
    }),
    output: outputResponseSchema(
      z.object({
        session: z.string().uuid(),
      })
    ),
  },
  postAuthNonce: {
    input: z.object({
      method: z.string(),
      email: z.optional(z.string()),
    }),
    output: outputResponseSchema(
      z.object({
        nonce: z.string(),
      })
    ),
  },
} as const satisfies ProcedureStructure;
