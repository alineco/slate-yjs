/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text bold italic />
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text italic underline />
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Transforms.setNodes(editor, { bold: null, underline: true }, { at: [0, 0] });
}
