/** @jsx jsx */
import { Editor, Element, Transforms } from 'slate';
import { jsx } from '../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <note-link noteId="note1">
        Meeting notes
        <cursor />
      </note-link>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <note-link noteId="note2">
        Meeting notes
        <cursor />
      </note-link>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Transforms.setNodes(
    editor,
    { noteId: 'note2' },
    {
      match: (node) => Element.isElement(node) && Editor.isInline(editor, node),
    }
  );
}
