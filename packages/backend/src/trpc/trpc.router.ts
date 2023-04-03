import type { TrpcRouterConformToApi } from '@aha/api';
import { router } from './trpc';
import { userProcedure } from '../modules/user/user.procedures';

export const appRouter = router({
  user: userProcedure,
}) satisfies TrpcRouterConformToApi;

export type AppRouter = typeof appRouter;
