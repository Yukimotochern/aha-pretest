import type { MapApiToTrpcRouter, ProcedureStructure } from './api.types';
import { auth } from './modules/auth/auth.api';

export const api = {
  auth,
} satisfies ProcedureStructure;

export type API = typeof api;

export type TrpcRouterConformToApi = MapApiToTrpcRouter<API>;
