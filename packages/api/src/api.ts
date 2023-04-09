import type { MapApiToTrpcRouter, ProcedureStructure } from './api.types';
import { user } from './modules/user/user.api';
import { auth } from './modules/auth/auth.api';

export const api = {
  user,
  auth,
} satisfies ProcedureStructure;

export type API = typeof api;

export type TrpcRouterConformToApi = MapApiToTrpcRouter<API>;
