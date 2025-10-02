/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled id="block1">
      <cursor />
      Hello world!
    </unstyled>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export const inputStoredPositions = {
  on: { path: [0, 0], offset: 0 },
  after: { path: [0, 0], offset: 1 },
};

export const expected = (
  <editor>
    <unstyled id="block1" />
    <unstyled id="block1">
      <cursor />
      Hello world!
    </unstyled>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export const expectedStoredPositions = {
  on: { path: [1, 0], offset: 0 },
  after: { path: [1, 0], offset: 1 },
};

export function run(editor: Editor) {
  Transforms.splitNodes(editor, { always: true });
}
