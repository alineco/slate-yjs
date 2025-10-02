import { Editor, Element, Transforms } from 'slate';
import * as Y from 'yjs';
import { wait } from './support/utils';
import { withYjs } from '../src';
import { yTextFactory } from './yTextFactory';

const INLINE_ELEMENTS = ['note-link', 'link'];

export interface WithTestingElementsOptions {
  doc?: Y.Doc;
  sharedType?: Y.XmlText;
}

export async function withTestingElements(
  editor: Editor,
  {
    doc,
    sharedType = yTextFactory(editor, doc),
  }: WithTestingElementsOptions = {}
) {
  const { normalizeNode, isInline } = editor;

  // normalizations needed for nested tests
  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // remove empty list
    if (
      Element.isElement(node) &&
      !Editor.isEditor(node) &&
      node.type === 'unordered-list'
    ) {
      if (!node.children.length) {
        return Transforms.removeNodes(editor, { at: path });
      }
    }

    normalizeNode(entry);
  };

  editor.isInline = (element) =>
    INLINE_ELEMENTS.includes(element.type as string) || isInline(element);

  const e = withYjs(editor, sharedType, { autoConnect: true });

  // Wait for editor to be initialized
  await wait();

  return e;
}
