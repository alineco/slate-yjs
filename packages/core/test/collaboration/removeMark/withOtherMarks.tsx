/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text bold italic>
        Hello
        <anchor /> world
        <focus />!
      </text>
    </unstyled>
  </editor>
);

export const initialRemoteSelection = { path: [0, 0], offset: 5 };

export const expected = (
  <editor>
    <unstyled>
      <text bold italic>
        Hello
      </text>
      <text italic>
        <anchor /> world
        <focus />
      </text>
      <text bold italic>
        !
      </text>
    </unstyled>
  </editor>
);

export const expectedRemoteSelection = { path: [0, 1], offset: 0 };

export function run(editor: Editor) {
  editor.removeMark('bold');
}
