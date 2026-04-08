import { Ancestor, RemoveTextOperation, Text } from 'slate';
import type * as Y from 'yjs';
import { getYTarget } from '../../utils/location';
import { insertEmptyText } from '../../utils/emptyText';
import { getProperties } from '../../utils/slate';

export function removeText(
  sharedRoot: Y.XmlText,
  slateRoot: Ancestor,
  op: RemoveTextOperation
): void {
  const { path, offset, text } = op;
  const { length } = text;

  const {
    yParent: target,
    textRange,
    slateTarget,
  } = getYTarget(sharedRoot, slateRoot, path);

  target.delete(textRange.start + offset, length);

  if (Text.isText(slateTarget) && slateTarget.text.length === length) {
    insertEmptyText(target, textRange.start, getProperties(slateTarget));
  }
}
