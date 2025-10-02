import { Node, SetNodeOperation, Text } from 'slate';
import * as Y from 'yjs';
import { getYTarget } from '../../utils/location';
import { insertEmptyText } from '../../utils/emptyText';

export function setNode(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  op: SetNodeOperation
): void {
  const { yTarget, textRange, yParent, slateTarget } = getYTarget(
    sharedRoot,
    slateRoot,
    op.path
  );

  const length = textRange.end - textRange.start;

  /**
   * If we're setting properties on an empty text node that lacks a
   * corresponding empty text character, insert that character and retry.
   */
  if (
    Text.isText(slateTarget) &&
    slateTarget.text.length === 0 &&
    length === 0
  ) {
    insertEmptyText(yParent, textRange.start);
    setNode(sharedRoot, slateRoot, op);
    return;
  }

  if (yTarget) {
    Object.entries(op.newProperties).forEach(([key, value]) => {
      if (value === null) {
        return yTarget.removeAttribute(key);
      }

      yTarget.setAttribute(key, value);
    });

    return Object.entries(op.properties).forEach(([key]) => {
      if (!op.newProperties.hasOwnProperty(key)) {
        yTarget.removeAttribute(key);
      }
    });
  }

  const unset = Object.fromEntries(
    Object.keys(op.properties).map((key) => [key, null])
  );
  const newProperties = { ...unset, ...op.newProperties };

  yParent.format(textRange.start, length, newProperties);
}
