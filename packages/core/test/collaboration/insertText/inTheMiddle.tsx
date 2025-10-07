/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      Hello <cursor />!
    </unstyled>
  </editor>
);

export const inputStoredPositions = {
  before: { path: [0, 0], offset: 5 },
  at: { path: [0, 0], offset: 6 },
  after: { path: [0, 0], offset: 7 },
};

export const initialRemoteSelection = inputStoredPositions.after;

export const expected = (
  <editor>
    <unstyled>
      Hello world
      <cursor />!
    </unstyled>
  </editor>
);

export const expectedStoredPositions = {
  before: { path: [0, 0], offset: 5 },
  at: { path: [0, 0], offset: 11 },
  after: { path: [0, 0], offset: 12 },
};

export const expectedRemoteSelection = expectedStoredPositions.after;

export function run(editor: Editor) {
  editor.insertText('world');
}
