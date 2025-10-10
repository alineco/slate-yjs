import { Ancestor, Operation } from 'slate';
import * as Y from 'yjs';

export type ApplyFunc<O extends Operation = Operation> = (
  sharedRoot: Y.XmlText,
  slateRoot: Ancestor,
  op: O
) => void;

export type OpMapper<O extends Operation = Operation> = {
  [K in O['type']]: O extends { type: K } ? ApplyFunc<O> : never;
};
