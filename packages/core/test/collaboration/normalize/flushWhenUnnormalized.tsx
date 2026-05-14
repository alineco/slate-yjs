/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';
import { YjsEditor } from '../../../src';
import { YJS_VERSION } from '../../support/utils';

export const skip =
  YJS_VERSION === 'oldest'
    ? 'Does not work correctly on the oldest supported version of Yjs'
    : false;

export const input = (
  <editor>
    <unstyled>
      <text bold>one</text>
      <text>two</text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text bold>one</text>
      <text>three</text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Editor.withoutNormalizing(editor, () => {
    editor.apply({
      type: 'insert_node',
      path: [0, 2],
      node: { text: 'three' },
    });

    // Results in an empty text node that should be normalized away
    editor.apply({
      type: 'remove_text',
      path: [0, 1],
      offset: 0,
      text: 'two',
    });

    /**
     * Before Slate has a chance to remove the empty text node, flush the local
     * changes so that the remote client receives an unnormalized Slate value
     * and must normalize itself.
     *
     * Flushing early in this manner isn't recommended, but testing this
     * behavior is useful because analogous situations can occur when two
     * connected clients have differing normalization logic.
     */
    YjsEditor.flushLocalChanges(editor as Editor & YjsEditor);

    /**
     * When we exit Editor.withoutNormalizing, we send a subsequent Yjs event to
     * remove the empty text node that the remote client should already have
     * removed. The important aspect of this test is whether the remote client
     * handles this correctly.
     */
  });
}
