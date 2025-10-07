/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      <anchor />
      Welcome to slate-yjs!
      <focus />
    </unstyled>
  </editor>
);

export const initialRemoteSelection = { path: [0, 1], offset: 0 };

export const expected = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      <cursor />
    </unstyled>
  </editor>
);

export const expectedRemoteSelection = { path: [0, 1], offset: 0 };

export function run(editor: Editor) {
  Transforms.delete(editor);
}
