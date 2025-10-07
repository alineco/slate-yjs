/** @jsx jsx */
import { jsx } from '../../support/jsx';
import { YHistoryEditor } from '../../../src';

export const input = (
  <editor>
    <unstyled>one</unstyled>
    <unstyled>
      <cursor />
    </unstyled>
  </editor>
);

export const inputStoredPositions = {
  cursor: { path: [1, 0], offset: 0 },
};

export const initialRemoteSelection = inputStoredPositions.cursor;

export const expected = (
  <editor>
    <unstyled>one</unstyled>
    <unstyled>
      <cursor />
    </unstyled>
  </editor>
);

export const expectedStoredPositions = inputStoredPositions;
export const expectedRemoteSelection = initialRemoteSelection;

export function run(editor: YHistoryEditor) {
  editor.insertText('world!');
  editor.undo();
}
