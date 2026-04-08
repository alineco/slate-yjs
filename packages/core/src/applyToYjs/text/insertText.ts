import { Ancestor, InsertTextOperation, Text } from 'slate';
import type * as Y from 'yjs';
import { getYTarget } from '../../utils/location';
import { getProperties } from '../../utils/slate';
import { isInsertDeltaEmptyText } from '../../utils/emptyText';

export function insertText(
  sharedRoot: Y.XmlText,
  slateRoot: Ancestor,
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

  if (isInsertDeltaEmptyText(targetDelta)) {
    target.delete(textRange.start, targetDelta[0].insert.length);
  }

  target.insert(
    textRange.start + op.offset,
    op.text,
    getProperties(slateTarget)
  );
}
