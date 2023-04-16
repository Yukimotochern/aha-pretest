import type { TrpcRouterConformToApi } from '@aha/api';
import { router } from './trpc';
import { authProcedures } from '../modules/auth/auth.procedures';

export const appRouter = router({
  auth: authProcedures,
}) satisfies TrpcRouterConformToApi;

export type AppRouter = typeof appRouter;
