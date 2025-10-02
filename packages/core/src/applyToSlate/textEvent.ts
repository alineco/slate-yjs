import { Editor, Node, Path, Point, Range, Text, Transforms } from 'slate';
import * as Y from 'yjs';
import { Delta, InsertDelta } from '../model/types';
import { deltaInsertToSlateNode } from '../utils/convert';
import { getSlateNodeYLength, getSlatePath } from '../utils/location';
import { deepEquals } from '../utils/object';
import { getProperties } from '../utils/slate';
import {
  EMPTY_TEXT_ATTRIBUTE,
  omitEmptyTextAttribute,
} from '../utils/emptyText';
import { ClonedSharedRoot } from '../utils/ClonedSharedRoot';
import { yTextToInsertDelta } from '../utils/delta';

function* getSlateTargetsInRange(
  editor: Editor,
  parentPath: Path,
  yParentDelta: InsertDelta,
  yStart: number,
  yEnd: number
): Generator<Path | Range> {
  let currentOffset = 0;

  for (const [node, path] of Node.children(editor, parentPath)) {
    if (currentOffset >= yEnd) return;

    const yLength = getSlateNodeYLength(node, {
      yParentDelta,
      yOffset: currentOffset,
    });

    // The offsets of yStart and yEnd relative to the current node
    const relativeYStart = Math.max(0, yStart - currentOffset);
    const relativeYEnd = yEnd - currentOffset;
    currentOffset += yLength;

    // Skip nodes that are entirely before yStart
    if (relativeYStart >= yLength) continue;

    const includesStart = relativeYStart === 0;
    const includesEnd = relativeYEnd >= yLength;

    // If the entire node is included, return just its path
    if (includesStart && includesEnd) {
      yield path;
      continue;
    }

    /**
     * Since only part of the node is included, it must be a non-empty text node
     * (since all other nodes are indivisible). This means that Yjs offsets can
     * be treated as Slate offsets.
     */
    yield {
      anchor: { path, offset: relativeYStart },
      focus: { path, offset: relativeYEnd },
    };
  }
}

type InsertMethod =
  | { method: 'insertText'; at: Point }
  | { method: 'insertNode'; at: Point | Path };

function getInsertMethod(
  editor: Editor,
  parentPath: Path,
  yParentDelta: InsertDelta,
  yOffset: number,
  attributes: Record<string, unknown>
): InsertMethod {
  const properties = omitEmptyTextAttribute(attributes);
  const isEmptyTextInsert = EMPTY_TEXT_ATTRIBUTE in attributes;
  const children = Array.from(Node.children(editor, parentPath));

  let currentOffset = 0;

  const getYLength = (node: Node) =>
    getSlateNodeYLength(node, {
      yParentDelta,
      yOffset: currentOffset,
    });

  const isValidInsertionNode = (node: Node, yLength: number): boolean => {
    if (isEmptyTextInsert) return false;

    if (!Text.isText(node)) return false;

    /**
     * Do not insert into empty text nodes with empty text characters, since
     * this interferes with subsequent operations.
     */
    if (node.text.length === 0 && yLength > 0) return false;

    return deepEquals(getProperties(node), properties);
  };

  for (const [node, path] of children) {
    const yLength = getYLength(node);
    let isFirstCandidate = false;

    // Continue reading Slate nodes until currentOffset >= yOffset
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

function applyDelta(
  editor: Editor,
  parentPath: Path,
  yParent: Y.XmlText,
  delta: Delta
) {
  const yParentDelta = yTextToInsertDelta(yParent);

  let yOffset = delta.reduce((length, change) => {
    if ('retain' in change) {
      return length + change.retain;
    }

    if ('delete' in change) {
      return length + change.delete;
    }

    return length;
  }, 0);

  const getTargetsInRange = (yLength: number) =>
    Array.from(
      getSlateTargetsInRange(
        editor,
        parentPath,
        yParentDelta,
        yOffset,
        yOffset + yLength
      )
    ).reverse();

  // Apply changes in reverse order to avoid path changes.
  delta
    .slice()
    .reverse()
    .forEach((change) => {
      if ('retain' in change) {
        yOffset -= change.retain;

        if ('attributes' in change) {
          const newProperties = omitEmptyTextAttribute(change.attributes);

          for (const at of getTargetsInRange(change.retain)) {
            if (Path.isPath(at)) {
              Transforms.setNodes(editor, newProperties, { at });
            } else {
              Transforms.setNodes(editor, newProperties, {
                at,
                match: Text.isText,
                split: true,
              });
            }
          }
        }
      }

      if ('delete' in change) {
        yOffset -= change.delete;

        for (const at of getTargetsInRange(change.delete)) {
          if (Path.isPath(at)) {
            Transforms.removeNodes(editor, { at });
          } else {
            Transforms.delete(editor, { at });
          }
        }
        return;
      }

      if ('insert' in change) {
        const { insert, attributes = {} } = change;
        const { method, at } = getInsertMethod(
          editor,
          parentPath,
          yParentDelta,
          yOffset,
          attributes
        );

        if (typeof insert === 'string' && method === 'insertText') {
          Transforms.insertText(editor, insert, { at });
          return;
        }

        const toInsert = deltaInsertToSlateNode(change);
        Transforms.insertNodes(editor, toInsert, { at });
      }
    });
}

export function applyYTextEvent(
  sharedRoot: Y.XmlText,
  prevSharedRoot: ClonedSharedRoot,
  editor: Editor,
  event: Y.YTextEvent
) {
  const { target: newTarget, changes } = event;
  const delta = event.delta as Delta;

  if (!(newTarget instanceof Y.XmlText)) {
    throw new Error('Unexpected target node type');
  }

  const prevTarget = prevSharedRoot.getCloned(newTarget);
  const slatePath = getSlatePath(prevSharedRoot.sharedRoot, editor, prevTarget);

  const keyChanges = Array.from(changes.keys.entries());
  if (slatePath.length > 0 && keyChanges.length > 0) {
    const newProperties = Object.fromEntries(
      keyChanges.map(([key, info]) => [
        key,
        info.action === 'delete' ? null : newTarget.getAttribute(key),
      ])
    );

    Transforms.setNodes(editor, newProperties, { at: slatePath });
  }

  if (delta.length > 0) {
    applyDelta(editor, slatePath, prevTarget, delta);
  }
}
