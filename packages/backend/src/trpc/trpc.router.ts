import type { TrpcRouterConformToApi } from '@aha/api';
import { router } from './trpc';
import { userProcedures } from '../modules/user/user.procedures';
import { authProcedures } from '../modules/auth/auth.procedures';

export const appRouter = router({
  user: userProcedures,
  auth: authProcedures,
}) satisfies TrpcRouterConformToApi;

export type AppRouter = typeof appRouter;
