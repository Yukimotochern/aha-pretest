import { trpcRouterBuilderStructure, TrpcRouterConformToApi } from '@aha/api';

import { privateProcedure, router } from '../../trpc/trpc';

const {
  userProfile: { patchApi, getApi },
} = trpcRouterBuilderStructure;

export const userProfileProcedures = router({
  patch: patchApi(privateProcedure).mutation(
    async ({
      ctx: {
        user: { sub },
        prisma,
        res,
        logger,
      },
      input,
    }) => {
      logger.info({ sub, input }, 'Update user profile.');
      const profile = await prisma.userProfile.update({
        where: {
          userSub: sub,
        },
        data: input,
      });
      logger.info({ profile, sub }, 'Update user profile result.');
      return res.ok(profile);
    }
  ),
  get: getApi(privateProcedure).query(
    async ({
      ctx: {
        user: { sub },
        prisma,
        res,
        logger,
      },
    }) => {
      logger.info({ sub }, 'Get user profile.');
      const profile = await prisma.userProfile.findFirstOrThrow({
        where: {
          userSub: sub,
        },
      });
      logger.info({ profile }, 'Get user profile result.');
      return res.ok(profile);
    }
  ),
}) satisfies TrpcRouterConformToApi['userProfile'];
