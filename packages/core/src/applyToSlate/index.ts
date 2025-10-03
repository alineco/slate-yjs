import { Editor } from 'slate';
import * as Y from 'yjs';
import { applyYTextEvent } from './textEvent';
import { ClonedSharedRoot } from '../utils/ClonedSharedRoot';

function applyYjsEvent(
  prevSharedRoot: ClonedSharedRoot,
  editor: Editor,
  event: Y.YEvent<Y.XmlText>
) {
  if (event instanceof Y.YTextEvent) {
    applyYTextEvent(prevSharedRoot, editor, event);
    return;
  }

  throw new Error('Unexpected Y event type');
}

/**
 * Applies Yjs events to the Slate editor. Assumes that the editor state matches
 * prevSharedRoot.
 */
export function applyYjsEvents(
  prevSharedRoot: ClonedSharedRoot,
  editor: Editor,
  events: Y.YEvent<Y.XmlText>[]
) {
  Editor.withoutNormalizing(editor, () => {
    events.forEach((event) => {
      applyYjsEvent(prevSharedRoot, editor, event);
      prevSharedRoot.applyEvent(event);
    });
  });
}
