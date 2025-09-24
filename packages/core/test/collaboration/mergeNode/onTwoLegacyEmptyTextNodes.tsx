/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../support/jsx';
import { yTextFactory } from '../../yTextFactory';

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

export const yInput = yTextFactory(
  <editor>
    <unstyled>
      <link />
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
  Editor.withoutNormalizing(editor, () => {
    Transforms.removeNodes(editor, { at: [0, 1] });
    Transforms.mergeNodes(editor, { at: [0, 1] });
  });
}
