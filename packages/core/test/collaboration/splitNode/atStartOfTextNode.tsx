/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text bold>
        <cursor />
        hello
      </text>
    </unstyled>
  </editor>
);

export const inputStoredPositions = {
  on: { path: [0, 0], offset: 0 },
  after: { path: [0, 0], offset: 1 },
};

export const expected = (
  <editor>
    <unstyled>
      <text bold />
    </unstyled>
    <unstyled>
      <text bold italic>
        <cursor />
        hello
      </text>
    </unstyled>
  </editor>
);

export const expectedStoredPositions = {
  on: { path: [1, 0], offset: 0 },
  after: { path: [1, 0], offset: 1 },
};

export function run(editor: Editor) {
  Editor.withoutNormalizing(editor, () => {
    editor.apply({
      type: 'split_node',
      path: [0, 0],
      position: 0,
      properties: { bold: true, italic: true },
    });

    editor.apply({
      type: 'split_node',
      path: [0],
      position: 1,
      properties: { type: 'unstyled' },
    });
  });
}
