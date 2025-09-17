/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text>one</text>
      <text bold>
        <cursor />
      </text>
      <text>three</text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text>one</text>
      <text bold>
        two
        <cursor />
      </text>
      <text>three</text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  editor.insertText('two');
}
