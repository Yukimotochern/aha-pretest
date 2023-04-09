import { z } from 'zod';
import * as zp from '@aha/prisma';
import type { ProcedureStructure } from '../../api.types';
import { response } from '../../backend/response';

export const user = {
  get: {
    input: zp.UserFindFirstArgsSchema,
    output: response(zp.UserSchema)
      .error({
        code: 'abcdef',
        message: '',
        errorData: z.any(),
      })
      .error({
        code: 'abcdefg',
        message: 'ddd',
        errorData: z.null(),
      }),
  },
  post: {
    input: zp.UserCreateInputSchema,
    output: response(zp.UserSchema),
  },
} satisfies ProcedureStructure;
