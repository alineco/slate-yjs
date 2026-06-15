import * as Y from 'yjs';
import { Ancestor, Descendant } from 'slate';
import { slateNodesToInsertDelta } from '../../src';

export const YJS_VERSION =
  'version' in Y && Y.version === 'oldest' ? 'oldest' : 'latest';

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

export async function wait(ms = 0) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
