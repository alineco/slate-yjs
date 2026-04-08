/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text>one </text>
      <text bold>two</text>
      <text> three</text>
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

// Remove content in an idiosyncratic order as real editors do
export function run(editor: Editor) {
  Editor.withoutNormalizing(editor, () => {
    editor.apply({
      type: 'remove_text',
      path: [0, 0],
      offset: 0,
      text: 'one ',
    });

    editor.apply({
      type: 'remove_node',
      path: [0, 1],
      node: <text bold>two</text>,
    });

    editor.apply({
      type: 'remove_text',
      path: [0, 1],
      offset: 0,
      text: ' three',
    });

    editor.apply({
      type: 'remove_node',
      path: [0, 0],
      node: <text />,
    });
  });
}
