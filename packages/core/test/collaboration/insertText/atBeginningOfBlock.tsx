/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      <cursor />
      to slate-yjs!
    </unstyled>
  </editor>
);

export const inputStoredPositions = {
  on: { path: [1, 0], offset: 0 },
  after: { path: [1, 0], offset: 1 },
};

export const expected = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      Welcome <cursor />
      to slate-yjs!
    </unstyled>
  </editor>
);

export const expectedStoredPositions = {
  on: { path: [1, 0], offset: 8 },
  after: { path: [1, 0], offset: 9 },
};

export function run(editor: Editor) {
  editor.insertText('Welcome ');
}
