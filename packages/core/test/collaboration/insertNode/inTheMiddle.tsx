/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      Welcome
      <cursor />
      to slate-yjs!
    </unstyled>
  </editor>
);

export const inputStoredPositions = {
  before: { path: [1, 0], offset: 6 },
  at: { path: [1, 0], offset: 7 },
  after: { path: [1, 0], offset: 8 },
};

export const expected = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>Welcome</unstyled>
    <h1>
      Foo bar!
      <cursor />
    </h1>
    <unstyled>to slate-yjs!</unstyled>
  </editor>
);

export const expectedStoredPositions = {
  before: { path: [1, 0], offset: 6 },
  at: { path: [3, 0], offset: 0 },
  after: { path: [3, 0], offset: 1 },
};

export function run(editor: Editor) {
  editor.insertNode(<h1>Foo bar!</h1>);
}
