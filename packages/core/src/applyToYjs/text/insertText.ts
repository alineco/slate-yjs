import { InsertTextOperation, Node, Text } from 'slate';
import type * as Y from 'yjs';
import { getYTarget } from '../../utils/location';
import { getProperties } from '../../utils/slate';
import { EMPTY_TEXT_ATTRIBUTE } from '../../utils/emptyText';
import { DeltaInsert } from '../../model/types';

export function insertText(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  op: InsertTextOperation
): void {
  const {
    yParent: target,
    textRange,
    slateTarget,
    targetDelta,
  } = getYTarget(sharedRoot, slateRoot, op.path);

  if (!Text.isText(slateTarget)) {
    throw new Error('Cannot insert text into non-text node');
  }

  const targetDeltaInsert = targetDelta[0] as DeltaInsert | undefined;

  if (targetDeltaInsert?.attributes?.[EMPTY_TEXT_ATTRIBUTE]) {
    target.delete(textRange.start, targetDeltaInsert.insert.length);
  }

  target.insert(
    textRange.start + op.offset,
    op.text,
    getProperties(slateTarget)
  );
}
