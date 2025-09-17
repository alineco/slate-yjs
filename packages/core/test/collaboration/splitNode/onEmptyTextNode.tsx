/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text bold>
        <cursor />
      </text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text bold />
    </unstyled>
    <unstyled>
      <text bold italic>
        <cursor />
      </text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Editor.withoutNormalizing(editor, () => {
    editor.apply({
      type: 'split_node',
      path: [0, 0],
      position: 0,
      properties: { bold: true, italic: true },
    });

    editor.apply({
      type: 'split_node',
      path: [0],
      position: 1,
      properties: { type: 'unstyled' },
    });
  });
}
