import * as Y from 'yjs';
import { DeltaInsert } from '../src/model/types';
import { normalizeInsertDelta } from '../src/utils/delta';

export interface RecursiveDeltaInsert extends Omit<DeltaInsert, 'insert'> {
  insert: string | RecursiveInsertDelta | RecursiveDeltaInsert;
}

export type RecursiveInsertDelta = RecursiveDeltaInsert[];

export function inspectYText(yText: Y.XmlText): RecursiveDeltaInsert {
  const delta = normalizeInsertDelta(yText.toDelta());

  const mappedDelta = delta.map(({ insert, ...rest }) =>
    typeof insert === 'string' ? { insert, ...rest } : inspectYText(insert)
  );

  const attributes = yText.getAttributes();

  return { attributes, insert: mappedDelta };
}
