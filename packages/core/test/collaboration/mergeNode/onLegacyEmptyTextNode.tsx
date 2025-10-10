/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../support/jsx';
import { yTextFactory } from '../../support/utils';

export const input = (
  <editor>
    <unstyled>
      <text italic />
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
      <text bold>hello</text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Editor.withoutNormalizing(editor, () => {
    Transforms.insertNodes(editor, <text bold>hello</text>, { at: [0, 0] });
    Transforms.mergeNodes(editor, { at: [0, 1] });
  });
}
