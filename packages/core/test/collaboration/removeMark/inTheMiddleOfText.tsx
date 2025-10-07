/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text bold>
        Hello
        <anchor /> world
        <focus />!
      </text>
    </unstyled>
  </editor>
);

export const initialRemoteSelection = { path: [0, 0], offset: 6 };

export const expected = (
  <editor>
    <unstyled>
      <text bold>Hello</text>
      <text>
        <anchor /> world
        <focus />
      </text>
      <text bold>!</text>
    </unstyled>
  </editor>
);

export const expectedRemoteSelection = { path: [0, 1], offset: 1 };

export function run(editor: Editor) {
  editor.removeMark('bold');
}
