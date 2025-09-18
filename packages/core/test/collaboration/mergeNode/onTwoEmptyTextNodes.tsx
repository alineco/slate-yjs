/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text bold />
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text italic />
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Editor.withoutNormalizing(editor, () => {
    Transforms.insertNodes(editor, <text italic />, { at: [0, 0] });
    Transforms.mergeNodes(editor, { at: [0, 1] });
  });
}
