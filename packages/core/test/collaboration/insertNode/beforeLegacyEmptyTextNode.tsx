/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';
import { yTextFactory } from '../../support/utils';

export const input = (
  <editor>
    <unstyled>
      <cursor />
    </unstyled>
  </editor>
);

export const yInput = yTextFactory(
  <editor>
    <unstyled />
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text />
      <link>
        <cursor />
      </link>
      <text />
    </unstyled>
  </editor>
);

export const bidirectionalSync = true;

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
