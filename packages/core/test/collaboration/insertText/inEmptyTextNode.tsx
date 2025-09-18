/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text>one</text>
      <text italic>three</text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text>one</text>
      <text bold>two</text>
      <text italic>three</text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Editor.withoutNormalizing(editor, () => {
    Transforms.insertNodes(editor, <text bold />, { at: [0, 1] });
    Transforms.insertText(editor, 'two', { at: [0, 1] });
  });
}
