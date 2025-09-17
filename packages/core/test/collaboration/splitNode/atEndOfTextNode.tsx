/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
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
      <text bold>hello</text>
      <text bold italic>
        <cursor />
      </text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  editor.apply({
    type: 'split_node',
    path: [0, 0],
    position: 5,
    properties: { bold: true, italic: true },
  });
}
