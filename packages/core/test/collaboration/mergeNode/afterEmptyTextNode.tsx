/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text bold />
      <text italic>hello</text>
    </unstyled>
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
  Transforms.mergeNodes(editor, { at: [0, 1] });
}
