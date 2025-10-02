/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled id="block1">
      Hello world!
      <cursor />
    </unstyled>
    <unstyled id="block2">Welcome to slate-yjs!</unstyled>
  </editor>
);

export const inputStoredPositions = {
  block1Start: { path: [0, 0], offset: 0 },
  block1End: { path: [0, 0], offset: 12 },
  block2Start: { path: [1, 0], offset: 0 },
  block2End: { path: [1, 0], offset: 21 },
};

export const expected = (
  <editor>
    <unstyled id="block2">Welcome to slate-yjs!</unstyled>
    <unstyled id="block1">
      Hello world!
      <cursor />
    </unstyled>
  </editor>
);

export const expectedStoredPositions = {
  block1Start: { path: [1, 0], offset: 0 },
  block1End: { path: [1, 0], offset: 12 },
  block2Start: { path: [0, 0], offset: 0 },
  block2End: { path: [0, 0], offset: 21 },
};

export function run(editor: Editor) {
  Transforms.moveNodes(editor, {
    at: [0],
    to: [1],
  });
}
