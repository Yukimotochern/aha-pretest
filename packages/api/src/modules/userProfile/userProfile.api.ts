import { UserProfileSchema, UserProfilePartialSchema } from '@aha/prisma';
import type { ProcedureStructure } from '../../api.types';
import { outputSchema } from '../../backend/response';
import { z } from 'zod';

const profileResponse = outputSchema(UserProfileSchema);

export const userProfile = {
  patch: {
    input: UserProfilePartialSchema.omit({
      id: true,
      userSub: true,
    }),
    output: profileResponse,
    openapi: {
      method: 'PATCH',
      path: '/userProfile/patch',
      protect: true,
      tags: ['User Profile'],
      description: 'This is used to change the username.',
    },
  },
  get: {
    input: z.void(),
    output: profileResponse,
    openapi: {
      method: 'GET',
      path: '/userProfile/get',
      protect: true,
      tags: ['User Profile'],
      description: 'This will return the user profile.',
    },
  },
} satisfies ProcedureStructure;
