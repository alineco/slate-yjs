/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <anchor />
      Hello <focus />
      world!
    </unstyled>
  </editor>
);

export const inputStoredPositions = {
  start: { path: [0, 0], offset: 0 },
  removed: { path: [0, 0], offset: 1 },
  end: { path: [0, 0], offset: 6 },
};

export const initialRemoteSelection = { path: [0, 0], offset: 12 };

export const expected = (
  <editor>
    <unstyled>
      <cursor />
      world!
    </unstyled>
  </editor>
);

export const expectedRemoteSelection = { path: [0, 0], offset: 6 };

export const expectedStoredPositions = {
  start: { path: [0, 0], offset: 0 },
  removed: { path: [0, 0], offset: 0 },
  end: { path: [0, 0], offset: 0 },
};

export function run(editor: Editor) {
  Transforms.delete(editor);
}
