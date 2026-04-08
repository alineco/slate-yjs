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
  at: { path: [0, 0], offset: 0 },
};

export const expected = (
  <editor>
    <unstyled>
      <text>hello</text>
    </unstyled>
  </editor>
);

export const expectedStoredPositions = {
  at: { path: [0, 0], offset: 0 },
};

export function run(editor: Editor) {
  editor.insertText('hello');
}
