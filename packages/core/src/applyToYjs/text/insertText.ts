import { InsertTextOperation, Node, Text } from 'slate';
import type * as Y from 'yjs';
import { getYTarget } from '../../utils/location';
import { getProperties } from '../../utils/slate';
import { emptyTextAttribute } from '../../utils/yjs';

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

  if (targetDelta[0].attributes?.[emptyTextAttribute]) {
    target.delete(textRange.start, 1);
  }

  target.insert(
    textRange.start + op.offset,
    op.text,
    getProperties(slateTarget)
  );
}
