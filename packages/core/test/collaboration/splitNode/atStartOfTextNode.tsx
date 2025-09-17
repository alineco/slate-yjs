/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text bold>
        <cursor />
        hello
      </text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text bold />
      <text bold italic>
        <cursor />
        hello
      </text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  editor.apply({
    type: 'split_node',
    path: [0, 0],
    position: 0,
    properties: { bold: true, italic: true },
  });
}
