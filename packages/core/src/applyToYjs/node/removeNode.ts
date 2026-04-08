import { Ancestor, RemoveNodeOperation } from 'slate';
import * as Y from 'yjs';
import { getYTarget } from '../../utils/location';

export function removeNode(
  sharedRoot: Y.XmlText,
  slateRoot: Ancestor,
  op: RemoveNodeOperation
): void {
  const { yParent: parent, textRange } = getYTarget(
    sharedRoot,
    slateRoot,
    op.path
  );
  parent.delete(textRange.start, textRange.end - textRange.start);
}
