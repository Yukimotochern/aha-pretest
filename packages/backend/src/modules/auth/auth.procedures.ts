import { randomUUID } from 'node:crypto';
import { api, TrpcRouterConformToApi } from '@aha/api';
import { publicProcedure, router } from '../../trpc/trpc';

const {
  auth: { startSession, postAuthNonce },
} = api;
export const authProcedures = router({
  startSession: publicProcedure
    .input(startSession.input)
    .output(startSession.output.schema)
    .mutation(
      async ({
        input: { token, isRedirect, sub },
        ctx: { res, redis, logger },
      }) => {
        if (isRedirect) {
          /* login or signup */
        } else {
          /* start a new session */
        }
        return res.ok({
          session: randomUUID(),
        });
      }
    ),
  postAuthNonce: publicProcedure
    .input(postAuthNonce.input)
    .output(postAuthNonce.output.schema)
    .mutation(
      async ({ input: { email, method }, ctx: { res, redis, logger } }) => {
        const nonce = `auth:nonce:${randomUUID()}`;
        await redis.hmset(nonce, { email, method });
        return res.ok({ nonce });
      }
    ),
}) satisfies TrpcRouterConformToApi['auth'];
