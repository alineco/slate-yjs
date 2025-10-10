/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <cursor />
      Hello world!
    </unstyled>
    <unstyled id="myBlockId">Welcome to slate-yjs!</unstyled>
  </editor>
);

export const inputStoredPositions = {
  removed: { path: [0, 0], offset: 0 },
  after: { path: [1, 0], offset: 0 },
};

export const expected = (
  <editor>
    <unstyled id="myBlockId">
      <cursor />
      Welcome to slate-yjs!
    </unstyled>
  </editor>
);

export const expectedStoredPositions = {
  /**
   * For some reason, removed is only this point when withYHistory is used.
   * Otherwise, removed becomes null.
   */
  removed: { path: [0, 0], offset: 0 },
  after: { path: [0, 0], offset: 0 },
};

export function run(editor: Editor) {
  Transforms.removeNodes(editor);
}
