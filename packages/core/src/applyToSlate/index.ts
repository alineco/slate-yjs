import { Editor } from 'slate';
import * as Y from 'yjs';
import { applyYTextEvent } from './textEvent';
import { ClonedSharedRoot } from '../utils/ClonedSharedRoot';

function applyYjsEvent(
  clonedSharedRoot: ClonedSharedRoot,
  editor: Editor,
  event: Y.YEvent<Y.XmlText>
) {
  if (event instanceof Y.YTextEvent) {
    applyYTextEvent(clonedSharedRoot, editor, event);
    return;
  }

  throw new Error('Unexpected Y event type');
}

/**
 * Applies Yjs events to the Slate editor. Assumes that the editor state matches
 * clonedSharedRoot.
 */
export function applyYjsEvents(
  clonedSharedRoot: ClonedSharedRoot,
  editor: Editor,
  events: Y.YEvent<Y.XmlText>[]
) {
  Editor.withoutNormalizing(editor, () => {
    events.forEach((event) => {
      applyYjsEvent(clonedSharedRoot, editor, event);
      clonedSharedRoot.applyEvent(event);
    });
  });
}
