/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      <cursor />
      Welcome to slate-yjs!
    </unstyled>
  </editor>
);

export const inputStoredPositions = {
  before: { path: [0, 0], offset: 12 },
  at: { path: [1, 0], offset: 0 },
  after: { path: [1, 0], offset: 1 },
};

export const expected = (
  <editor>
    <unstyled>
      Hello world!
      <cursor />
      Welcome to slate-yjs!
    </unstyled>
  </editor>
);

export const expectedStoredPositions = {
  before: { path: [0, 0], offset: 12 },
  at: { path: [0, 0], offset: 12 },
  after: { path: [0, 0], offset: 13 },
};

export function run(editor: Editor) {
  editor.deleteBackward('character');
}
