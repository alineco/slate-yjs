/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text bold>one</text>
      <text italic>
        <anchor />
        two
        <focus />
      </text>
      <text bold>three</text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text bold>one</text>
      <text italic>
        <cursor />
      </text>
      <text bold>three</text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Transforms.delete(editor);
}
