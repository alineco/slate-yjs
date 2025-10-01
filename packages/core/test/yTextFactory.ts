import { Ancestor, Descendant } from 'slate';
import * as Y from 'yjs';
import { slateNodesToInsertDelta } from '../src';

export function yTextFactory(
  ancestorOrChildren: Ancestor | Descendant[],
  doc = new Y.Doc()
): Y.XmlText {
  const sharedType = doc.get('sharedRoot', Y.XmlText) as Y.XmlText;

  if (sharedType.toDelta().length === 0) {
    const children = Array.isArray(ancestorOrChildren)
      ? ancestorOrChildren
      : ancestorOrChildren.children;
    sharedType.applyDelta(slateNodesToInsertDelta(children));
  }

  return sharedType;
}
