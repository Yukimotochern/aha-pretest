import { z } from 'zod';
import type { ProcedureStructure } from '../../api.types';
import { response } from '../../backend/response';

export const auth = {
  startSession: {
    input: z.object({
      token: z.string(),
      isRedirect: z.boolean(),
      sub: z.string(),
    }),
    output: response(
      z.object({
        session: z.string().uuid(),
      })
    ),
  },
} satisfies ProcedureStructure;
