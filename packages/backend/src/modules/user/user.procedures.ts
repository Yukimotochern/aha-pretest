import { api } from '@aha/api';
import { publicProcedure, router } from '../../trpc/trpc';

const {
  user: { get },
} = api;

export const userProcedure = router({
  get: publicProcedure
    .input(get.input)
    .output(get.output.schema)
    .query(({ ctx: { okResponse, errorResponse } }) => {
      if (Math.random() > 0.5) {
        return errorResponse({
          code: 'abcdef',
          message: '',
          errorData: {},
        });
      } else if (Math.random() > 0.4) {
        return errorResponse({
          code: 'abcdefg',
          message: 'ddd',
          errorData: null,
        });
      }
      return okResponse({
        email: 'ddd',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),
});
