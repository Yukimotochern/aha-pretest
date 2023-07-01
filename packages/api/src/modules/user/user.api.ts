import { z } from 'zod';
import type { ProcedureStructure } from '../../api.types';
import { outputSchema } from '../../backend/response';

export const user = {
  getUserStatistics: {
    input: z.object({
      utcOffset: z.number(),
    }),
    output: outputSchema(
      z.object({
        statistics: z.object({
          numOfUser: z.number(),
          activeUserToday: z.number(),
          avgSessionUsersLastSevenDays: z.number(),
        }),
        userData: z.array(
          z.object({
            key: z.string(),
            createdAt: z.date(),
            loginTimes: z.number(),
            lastSession: z.optional(z.date()),
          })
        ),
      })
    ),
    openapi: {
      method: 'GET',
      path: '/user/getUserStatistics',
      protect: true,
      tags: ['User'],
      description:
        'Return user statistics calculated by the UTC offset provided.',
    },
  },
} satisfies ProcedureStructure;
