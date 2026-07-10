/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <cursor />
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text />
      <link>
        <text />
      </link>
      <text>
        <cursor />
      </text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  editor.apply({
    type: 'insert_node',
    path: [0, 0],
    node: (
      <link>
        <text />
      </link>
    ),
  });
}
