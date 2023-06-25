import { z, ZodTypeAny } from 'zod';
import {
  Procedure,
  ProcedureType,
  ProcedureParams,
  AnyRootConfig,
  ProcedureBuilder,
  unsetMarker,
} from '@trpc/server';
import { OpenApiMeta } from 'trpc-openapi';
import { OutputSchema } from './backend/response';

// import { UnsetMarker } from '@trpc/server/src/core/internals/utils';

export interface ProcedureSchema {
  input?: ZodTypeAny;
  output?: OutputSchema<ZodTypeAny>;
  openapi?: OpenApiMeta['openapi'];
}

export interface ProcedureStructure {
  [key: PropertyKey]: ProcedureSchema | ProcedureStructure;
}

export type UnsetMarker = typeof unsetMarker;

export type EmptyProcedureBuilder = ProcedureBuilder<
  ProcedureParams<
    AnyRootConfig,
    unknown,
    UnsetMarker,
    UnsetMarker,
    UnsetMarker,
    UnsetMarker
  >
>;

export type TrpcRouterBuilderStructure<API extends ProcedureStructure> = {
  [key in keyof API as API[key] extends ProcedureStructure
    ? key
    : key extends string
    ? `${key}Api`
    : never]: API[key] extends ProcedureStructure
    ? TrpcRouterBuilderStructure<API[key]>
    : API[key] extends ProcedureSchema
    ? <Builder>(
        builder: Builder
      ) => Builder extends ProcedureBuilder<infer TParams>
        ? ProcedureBuilder<
            ProcedureParams<
              TParams['_config'],
              TParams['_ctx_out'],
              API[key]['input'] extends ZodTypeAny
                ? z.infer<API[key]['input']>
                : TParams['_input_out'],
              API[key]['input'] extends ZodTypeAny
                ? z.infer<API[key]['input']>
                : TParams['_input_out'],
              API[key]['output'] extends OutputSchema<ZodTypeAny>
                ? z.infer<API[key]['output']['schema']>
                : TParams['_output_in'],
              API[key]['output'] extends OutputSchema<ZodTypeAny>
                ? z.infer<API[key]['output']['schema']>
                : TParams['_output_out'],
              API[key]['openapi'] extends OpenApiMeta['openapi']
                ? TParams['_meta'] & { openapi: API[key]['openapi'] }
                : TParams['_meta']
            >
          >
        : never
    : never;
};

export type MapToTrpcRouterBuilderStructure<API extends ProcedureStructure> = (
  api: Record<string, unknown>
) => TrpcRouterBuilderStructure<API>;

export type MapApiToTrpcRouter<API extends ProcedureStructure> = {
  [key in keyof API]: API[key] extends ProcedureStructure
    ? MapApiToTrpcRouter<API[key]>
    : API[key] extends ProcedureSchema
    ? Procedure<
        ProcedureType,
        ProcedureParams<
          AnyRootConfig,
          unknown,
          API[key]['input'] extends ZodTypeAny
            ? z.infer<API[key]['input']>
            : unknown,
          API[key]['input'] extends ZodTypeAny
            ? z.infer<API[key]['input']>
            : unknown,
          API[key]['output'] extends OutputSchema<ZodTypeAny>
            ? z.infer<API[key]['output']['schema']>
            : unknown,
          API[key]['output'] extends OutputSchema<ZodTypeAny>
            ? z.infer<API[key]['output']['schema']>
            : unknown
        >
      >
    : never;
};
