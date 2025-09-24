/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text italic />
      {/* Prevent normalize from merging empty text nodes */}
      <link />
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
    Transforms.removeNodes(editor, { at: [0, 1] });
    Transforms.mergeNodes(editor, { at: [0, 1] });
  });
}
