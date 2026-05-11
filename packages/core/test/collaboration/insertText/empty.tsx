/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text />
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text />
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  editor.apply({
    type: 'insert_text',
    path: [0, 0],
    offset: 0,
    text: '',
  });
}
