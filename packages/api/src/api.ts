import type { MapApiToTrpcRouter, ProcedureStructure } from './api.types';
import { user } from './modules/user/user.api';

export const api = {
  user,
} satisfies ProcedureStructure;

export type API = typeof api;

export type TrpcRouterConformToApi = MapApiToTrpcRouter<API>;
