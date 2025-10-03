import { Editor } from 'slate';
import * as Y from 'yjs';
import { applyYTextEvent } from './textEvent';
import { ClonedSharedRoot } from '../utils/ClonedSharedRoot';

/**
 * TODO: Update this comment.
 * Translate a yjs event into slate operations. The editor state has to match the
 * yText state before the event occurred.
 *
 * @param sharedType
 * @param op
 */
export function applyYjsEvent(
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
 * TODO: Update this comment.
 * Translates yjs events into slate operations and applies them to the editor. The
 * editor state has to match the yText state before the events occurred.
 *
 * @param sharedRoot
 * @param editor
 * @param events
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
