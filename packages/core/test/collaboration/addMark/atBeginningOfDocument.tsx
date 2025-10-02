/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <anchor />
      Hello
      <focus /> world!
    </unstyled>
  </editor>
);

export const inputStoredPositions = {
  after: { path: [0, 0], offset: 7 },
};

export const expected = (
  <editor>
    <unstyled>
      <anchor />
      <text bold>Hello</text>
      <focus /> world!
    </unstyled>
  </editor>
);

export const expectedStoredPositions = {
  after: { path: [0, 1], offset: 2 },
};

export function run(editor: Editor) {
  editor.addMark('bold', true);
}
