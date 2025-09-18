import { Node, RemoveTextOperation, Text } from 'slate';
import type * as Y from 'yjs';
import { getYTarget } from '../../utils/location';
import { emptyTextAttribute, emptyTextChar } from '../../utils/yjs';
import { getProperties } from '../../utils/slate';

export function removeText(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
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
    target.insert(textRange.start, emptyTextChar, {
      ...getProperties(slateTarget),
      [emptyTextAttribute]: true,
    });
  }
}
