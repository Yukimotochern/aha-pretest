import { ProcedureSchema, API } from '@aha/api';

type CombineKeysWithSeparator<K1, K2> = `${K1 & string}.${K2 & string}`;

type AllPathToPatternInObject<
  Obj,
  Pattern,
  Keys = keyof Obj
> = Keys extends keyof Obj
  ? Obj[Keys] extends Pattern
    ? Keys
    : CombineKeysWithSeparator<
        Keys,
        AllPathToPatternInObject<Obj[Keys], Pattern>
      >
  : never;

export type ApiProcedurePaths = AllPathToPatternInObject<API, ProcedureSchema>;
