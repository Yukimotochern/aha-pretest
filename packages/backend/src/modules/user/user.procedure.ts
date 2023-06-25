import { trpcRouterBuilderStructure, TrpcRouterConformToApi } from '@aha/api';
import dayjs from 'dayjs';

import { privateProcedure, router } from '../../trpc/trpc';
import { logger } from '../../utils/logger';

const {
  user: { getUserStatisticsApi },
} = trpcRouterBuilderStructure;

export const userProcedure = router({
  getUserStatistics: getUserStatisticsApi(privateProcedure).query(
    async ({ input: { utcOffset }, ctx }) => {
      const { res, prisma } = ctx;
      logger.info({ utcOffset }, 'Starting to get statistics with offset');
      const now = dayjs().utcOffset(utcOffset);
      const today = now.startOf('day');
      const todayStartsAt = today.toDate();
      const lastWeekStartsAt = today.subtract(7, 'days').toDate();
      const lastWeekEndsAt = today.toDate();
      logger.trace(
        {
          todayStartsAt,
          lastWeekStartsAt,
          lastWeekEndsAt,
        },
        'Calculate statistics with data:'
      );

      const [
        latestSessions,
        users,
        activeUserToday,
        sessionUsersLastSevenDays,
      ] = await Promise.all([
        prisma.session.findMany({
          distinct: ['userSub'],
          select: {
            userSub: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.user.findMany({
          select: {
            createdAt: true,
            loginTimes: true,
            sub: true,
          },
        }),
        prisma.user.count({
          where: {
            sessions: {
              some: {
                updatedAt: {
                  gte: todayStartsAt,
                },
              },
            },
          },
        }),
        prisma.session.count({
          where: {
            updatedAt: {
              gte: lastWeekStartsAt,
              lte: lastWeekEndsAt,
            },
          },
        }),
      ]);
      logger.trace(
        {
          latestSessions,
          users,
          activeUserToday,
          sessionUsersLastSevenDays,
        },
        'Query results.'
      );

      const userData = users.map(({ createdAt, loginTimes, sub }) => {
        const session = latestSessions.find(
          (session) => session.userSub === sub
        );
        return {
          createdAt,
          loginTimes,
          lastSession: session ? session.createdAt : undefined,
          key: sub,
        };
      });

      logger.info({ userData }, 'Successfully generate user data.');

      return res.ok({
        statistics: {
          numOfUser: userData.length,
          activeUserToday,
          avgSessionUsersLastSevenDays: sessionUsersLastSevenDays / 7,
        },
        userData,
      });
    }
  ),
}) satisfies TrpcRouterConformToApi['user'];
