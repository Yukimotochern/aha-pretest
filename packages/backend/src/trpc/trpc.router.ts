import type { TrpcRouterConformToApi } from '@aha/api';
import { generateOpenApiDocument } from 'trpc-openapi';
import { router } from './trpc';
import { authProcedures } from '../modules/auth/auth.procedure';
import { userProfileProcedures } from '../modules/userProfile/userProfile.procedure';
import { userProcedure } from '../modules/user/user.procedure';

export const appRouter = router({
  auth: authProcedures,
  userProfile: userProfileProcedures,
  user: userProcedure,
}) satisfies TrpcRouterConformToApi;

export const trpcOpenApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Get Aha Job tRPC OpenAPI',
  version: '1.0.0',
  baseUrl: 'http://0.0.0.0:4000/api',
  docsUrl: 'http://0.0.0.0:4000/docs',
});

export type AppRouter = typeof appRouter;
