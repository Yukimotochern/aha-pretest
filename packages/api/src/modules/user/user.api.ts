import { z } from 'zod';
import type { ProcedureStructure } from '../../api.types';
import { response } from '../../backend/response';

export const user = {
  get: {
    input: z.any(),
    output: response(z.any())
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
} satisfies ProcedureStructure;
