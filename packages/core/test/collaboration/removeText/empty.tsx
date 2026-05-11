/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text>test</text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text>test</text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Editor.withoutNormalizing(editor, () => {
    editor.apply({
      type: 'split_node',
      path: [0, 0],
      position: 0,
      properties: {},
    });

    editor.apply({
      type: 'remove_text',
      path: [0, 0],
      offset: 0,
      text: '',
    });
  });
}
