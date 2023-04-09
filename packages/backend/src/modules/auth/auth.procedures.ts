import crypto from 'node:crypto';
import { api, TrpcRouterConformToApi } from '@aha/api';
import { publicProcedure, router } from '../../trpc/trpc';

const {
  auth: { startSession },
} = api;
export const authProcedures = router({
  startSession: publicProcedure
    .input(startSession.input)
    .output(startSession.output.schema)
    .mutation(async ({ input, ctx: { okResponse, redis, logger } }) => {
      // starts here
      return okResponse({
        session: crypto.randomUUID(),
      });
    }),
}) satisfies TrpcRouterConformToApi['auth'];
