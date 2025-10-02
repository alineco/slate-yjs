/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      Hello <cursor />
    </unstyled>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export const inputStoredPositions = {
  before: { path: [0, 0], offset: 5 },
  on: { path: [0, 0], offset: 6 },
};

export const expected = (
  <editor>
    <unstyled>
      Hello world!
      <cursor />
    </unstyled>
    <unstyled>Welcome to slate-yjs!</unstyled>
  </editor>
);

export const expectedStoredPositions = {
  before: { path: [0, 0], offset: 5 },
  on: { path: [0, 0], offset: 6 },
};

export function run(editor: Editor) {
  editor.insertText('world!');
}
