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
      <text>
        <cursor />
      </text>
      <link>
        <text />
      </link>
      <text />
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  editor.apply({
    type: 'insert_node',
    path: [0, 1],
    node: (
      <link>
        <text />
      </link>
    ),
  });
}
