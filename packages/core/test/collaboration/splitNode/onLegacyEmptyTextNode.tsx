/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';
import { yTextFactory } from '../../support/utils';

export const input = (
  <editor>
    <unstyled>
      <text bold>
        <cursor />
      </text>
    </unstyled>
  </editor>
);

export const yInput = yTextFactory(
  <editor>
    <unstyled />
  </editor>
);

export const inputStoredPositions = {
  on: { path: [0, 0], offset: 0 },
};

export const expected = (
  <editor>
    <unstyled>
      <text />
    </unstyled>
    <unstyled>
      <text bold italic>
        <cursor />
      </text>
    </unstyled>
  </editor>
);

export const expectedStoredPositions = {
  on: { path: [0, 0], offset: 0 },
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
