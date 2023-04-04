import { api, TrpcRouterConformToApi } from '@aha/api';
import { publicProcedure, router } from '../../trpc/trpc';

const {
  user: { get, post },
} = api;

export const userProcedure = router({
  get: publicProcedure
    .input(get.input)
    .output(get.output.schema)
    .query(async ({ ctx: { okResponse, prisma, redis, logger } }) => {
      const email = await redis.get('email');
      logger.info({ email }, 'hi hi');
      const user = await prisma.user.findFirst();
      return okResponse(user);
    }),
  post: publicProcedure
    .input(post.input)
    .output(post.output.schema)
    .mutation(async ({ ctx: { okResponse, prisma, redis }, input }) => {
      await redis.set('email', input.email);
      const user = await prisma.user.create({
        data: {
          email: input.email,
        },
      });
      return okResponse(user);
    }),
}) satisfies TrpcRouterConformToApi['user'];
