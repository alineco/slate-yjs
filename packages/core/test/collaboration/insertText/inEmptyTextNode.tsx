/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text bold>
        <cursor />
      </text>
    </unstyled>
  </editor>
);

export const inputStoredPositions = {
  at: { path: [0, 0], offset: 0 },
};

export const expected = (
  <editor>
    <unstyled>
      <text bold>hello</text>
    </unstyled>
  </editor>
);

export const expectedStoredPositions = {
  at: { path: [0, 0], offset: 5 },
};

export function run(editor: Editor) {
  editor.insertText('hello');
}

export const skip =
  'Stored positions associate left instead of right on empty text nodes';
