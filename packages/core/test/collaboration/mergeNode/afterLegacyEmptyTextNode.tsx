/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../support/jsx';
import { yTextFactory } from '../../yTextFactory';

export const input = (
  <editor>
    <unstyled>
      <text bold />
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
      <text>hello</text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Editor.withoutNormalizing(editor, () => {
    Transforms.insertNodes(editor, <text italic>hello</text>, { at: [0, 1] });
    Transforms.mergeNodes(editor, { at: [0, 1] });
  });
}
