/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>Hello</unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>Hello</unstyled>
    <unstyled>
      <text bold />
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Transforms.insertNodes(
    editor,
    <unstyled>
      <text bold />
    </unstyled>,
    { at: [1] }
  );
}
