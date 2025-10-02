/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled id="block1">
      Hello world!
      <cursor />
    </unstyled>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export const inputStoredPositions = {
  before: { path: [0, 0], offset: 11 },
  on: { path: [0, 0], offset: 12 },
  nextBlock: { path: [1, 0], offset: 0 },
};

export const expected = (
  <editor>
    <unstyled id="block1">Hello world!</unstyled>
    <unstyled id="block1">
      <cursor />
    </unstyled>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export const expectedStoredPositions = {
  before: { path: [0, 0], offset: 11 },
  // Possibly this should be { path: [1, 0], offset: 0 } instead
  on: { path: [0, 0], offset: 12 },
  nextBlock: { path: [2, 0], offset: 0 },
};

export function run(editor: Editor) {
  Transforms.splitNodes(editor, { always: true });
}
