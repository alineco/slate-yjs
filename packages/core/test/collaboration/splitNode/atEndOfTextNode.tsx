/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text>one</text>
      <text bold>
        hello
        <cursor />
      </text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text>one</text>
      <text bold>hello</text>
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
      path: [0, 1],
      position: 5,
      properties: { bold: true, italic: true },
    });

    editor.apply({
      type: 'split_node',
      path: [0],
      position: 2,
      properties: { type: 'unstyled' },
    });
  });
}
