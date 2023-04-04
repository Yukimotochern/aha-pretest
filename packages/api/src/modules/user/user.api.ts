import { z } from 'zod';
import { prismaZodSchema as pzs } from '@aha/prisma';
import type { ProcedureStructure } from '../../api.types';
import { response } from '../../backend/response';

export const user = {
  get: {
    input: pzs.UserFindFirstArgsSchema,
    output: response(pzs.UserSchema)
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
    input: pzs.UserCreateInputSchema,
    output: response(pzs.UserSchema),
  },
} satisfies ProcedureStructure;
