import { z, ZodTypeAny } from 'zod';
import {
  Procedure,
  ProcedureType,
  ProcedureParams,
  AnyRootConfig,
} from '@trpc/server';
import { OutputResponse } from './backend/response';

export interface ProcedureSchema {
  input: ZodTypeAny;
  output: OutputResponse<ZodTypeAny>;
}

export interface ProcedureStructure {
  [key: PropertyKey]: ProcedureSchema | ProcedureStructure;
}

export type MapApiToTrpcRouter<API extends ProcedureStructure> = {
  [key in keyof API]: API[key] extends ProcedureStructure
    ? MapApiToTrpcRouter<API[key]>
    : API[key]['input'] extends ProcedureSchema['input']
    ? API[key]['output'] extends ProcedureSchema['output']
      ? Procedure<
          ProcedureType,
          ProcedureParams<
            AnyRootConfig,
            unknown,
            z.infer<API[key]['input']>,
            z.infer<API[key]['input']>,
            z.infer<API[key]['output']['schema']>,
            z.infer<API[key]['output']['schema']>
          >
        >
      : never
    : never;
};
