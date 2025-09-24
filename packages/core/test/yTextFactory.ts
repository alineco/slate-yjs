import { Editor } from 'slate';
import * as Y from 'yjs';
import { slateNodesToInsertDelta } from '../src';

export function yTextFactory(editor: Editor, doc = new Y.Doc()): Y.XmlText {
  const sharedType = doc.get('sharedRoot', Y.XmlText) as Y.XmlText;

  if (sharedType.toDelta().length === 0) {
    sharedType.applyDelta(slateNodesToInsertDelta(editor.children));
  }

  return sharedType;
}
