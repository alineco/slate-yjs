import { Editor, Node, Path, Point, Text } from 'slate';
import { InsertDelta } from '../model/types';
import { getSlateNodeYLength } from '../utils/location';
import { deepEquals } from '../utils/object';
import { getProperties } from '../utils/slate';
import {
  EMPTY_TEXT_ATTRIBUTE,
  omitEmptyTextAttribute,
} from '../utils/emptyText';

type InsertMethod =
  | { method: 'insertText'; at: Point }
  | { method: 'insertNode'; at: Point | Path };

/**
 * Determine whether an insert delta should be performed using insertText or
 * insertNode, and at what point or path.
 */
export function getInsertMethod(
  editor: Editor,
  parentPath: Path,
  yParentDelta: InsertDelta,
  yOffset: number,
  attributes: Record<string, unknown>
): InsertMethod {
  const properties = omitEmptyTextAttribute(attributes);
  const isInsertEmptyText = EMPTY_TEXT_ATTRIBUTE in attributes;
  const children = Array.from(Node.children(editor, parentPath));

  let currentOffset = 0;

  const getYLength = (node: Node) =>
    getSlateNodeYLength(node, {
      yParentDelta,
      yOffset: currentOffset,
    });

  /**
   * Determine whether inserting into a given node using insertText is valid.
   */
  const isValidInsertionNode = (node: Node, yLength: number): boolean => {
    // We cannot insert text into a non-text node
    if (!Text.isText(node)) return false;

    /**
     * Empty text characters should always be inserted as nodes, not into
     * existing text nodes.
     *
     * In addition, if the node is itself an empty text node and has an empty
     * text character, do not insert text into it, since this effectively
     * removes the existing empty text node from the Slate data structure
     * without removing it from the Yjs data structure, causing a mismatch.
     *
     * Legacy empty text nodes that lack corresponding empty text characters are
     * safe to insert into since they have no representation in Yjs, hence no
     * mismatch.
     */
    const isEmptyTextNodeWithChar = node.text.length === 0 && yLength > 0;
    if (isInsertEmptyText || isEmptyTextNodeWithChar) return false;

    return deepEquals(getProperties(node), properties);
  };

  for (const [node, path] of children) {
    const yLength = getYLength(node);
    let isFirstCandidate = false;

    if (currentOffset < yOffset) {
      currentOffset += yLength;

      /**
       * If yOffset is inside this node, there's only one possible insertion
       * point, so return it.
       */
      if (currentOffset > yOffset) {
        return {
          method: isValidInsertionNode(node, yLength)
            ? 'insertText'
            : 'insertNode',
          at: { path, offset: yOffset - currentOffset + yLength },
        };
      }

      if (currentOffset === yOffset) {
        isFirstCandidate = true;
      }
    }

    // So long as currentOffset === yOffset, each node is a candidate for insertion
    if (currentOffset === yOffset) {
      if (isValidInsertionNode(node, yLength)) {
        return {
          method: 'insertText',
          at: isFirstCandidate
            ? Editor.end(editor, path)
            : Editor.start(editor, path),
        };
      }

      /**
       * If we reach a non-empty node after the first candidate, there are no
       * more insertion candidates, so insert just before this non-empty node.
       */
      if (!isFirstCandidate && yLength > 0)
        return { method: 'insertNode', at: path };
    }
  }

  /**
   * None of the children were valid insertion targets, so insert after the last
   * child.
   */
  return { method: 'insertNode', at: [...parentPath, children.length] };
}
