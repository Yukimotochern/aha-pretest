import type { TrpcRouterConformToApi } from '@aha/api';
import { generateOpenApiDocument } from 'trpc-openapi';
import { router } from './trpc';
import { authProcedures } from '../modules/auth/auth.procedure';
import { userProfileProcedures } from '../modules/userProfile/userProfile.procedure';
import { userProcedure } from '../modules/user/user.procedure';
import { env } from '../environments/environment';

export const appRouter = router({
  auth: authProcedures,
  userProfile: userProfileProcedures,
  user: userProcedure,
}) satisfies TrpcRouterConformToApi;

export const trpcOpenApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Get Aha Job tRPC OpenAPI',
  description:
    'This api is aim for obtaining the job of Aha. The client will call the TRPC version of it and the Open API compatible routes are also exposed. Those two are exactly the same.',
  version: '1.0.0',
  baseUrl: `${env.backendUrl}/api`,
  docsUrl: `${env.backendUrl}/documentation/static/index.html`,
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      description: 'The token should be the session id.',
      scheme: 'bearer',
      bearerFormat: 'Session Id',
    },
  },
});

export type AppRouter = typeof appRouter;
