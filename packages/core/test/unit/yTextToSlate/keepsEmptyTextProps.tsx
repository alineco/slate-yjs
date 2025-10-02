/** @jsx jsx */
import { jsx } from '../../support/jsx';
import { YjsEditor, yTextToSlateElement } from '../../../src';

export const input = (
  <editor>
    <unstyled>
      <text bold />
    </unstyled>
  </editor>
);

export const expected = {
  children: [
    <unstyled>
      <text bold />
    </unstyled>,
  ],
};

export function run(editor: YjsEditor) {
  return yTextToSlateElement(editor.sharedRoot);
}
