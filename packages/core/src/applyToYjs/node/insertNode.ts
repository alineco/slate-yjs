import { Ancestor, Editor, InsertNodeOperation, Text } from 'slate';
import * as Y from 'yjs';
import { slateElementToYText } from '../../utils/convert';
import { getYTarget } from '../../utils/location';
import { getProperties } from '../../utils/slate';
import { insertEmptyText } from '../../utils/emptyText';

export function insertNode(
  sharedRoot: Y.XmlText,
  slateRoot: Ancestor,
  op: InsertNodeOperation
): void {
  const { yParent, textRange } = getYTarget(sharedRoot, slateRoot, op.path);

  if (Text.isText(op.node)) {
    const { node } = op;
    const { text } = node;
    const attributes = getProperties(node);

    if (text.length === 0) {
      insertEmptyText(yParent, textRange.start, attributes);
      return;
    }

    return yParent.insert(
      textRange.start,
      op.node.text,
      getProperties(op.node)
    );
  }

  if (Editor.isEditor(op.node)) {
    throw new Error('Cannot insert editor node');
  }

  yParent.insertEmbed(textRange.start, slateElementToYText(op.node));
}
