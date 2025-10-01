import {
  Ancestor,
  Editor,
  Element,
  Node,
  Path,
  Point,
  Range,
  Text,
} from 'slate';
import * as Y from 'yjs';
import { InsertDelta, YTarget } from '../model/types';
import {
  getNextDeltaInsert,
  sliceInsertDelta,
  yTextToInsertDelta,
} from './delta';
import { emptyTextAttribute } from './yjs';

export interface GetSlateNodeYLengthOptions {
  yParentDelta?: InsertDelta;
  yOffset?: number;
}

export function getSlateNodeYLength(
  node: Node | undefined,
  { yParentDelta, yOffset }: GetSlateNodeYLengthOptions = {}
): number {
  if (!node) return 0;
  if (!Text.isText(node)) return 1;

  const { length } = node.text;
  if (length > 0) return length;

  /**
   * This is an empty text node, so check if there are one or more empty text
   * characters in the yText at the current position.
   */
  if (!yParentDelta || yOffset === undefined) return 1;
  const nextInsert = getNextDeltaInsert(yParentDelta, yOffset);

  return nextInsert?.attributes?.[emptyTextAttribute] &&
    typeof nextInsert.insert === 'string'
    ? nextInsert.insert.length
    : 0;
}

export function slatePathOffsetToYOffset(
  element: Element,
  pathOffset: number,
  options?: Omit<GetSlateNodeYLengthOptions, 'yOffset'>
) {
  return element.children
    .slice(0, pathOffset)
    .reduce(
      (yOffset, node) =>
        yOffset + getSlateNodeYLength(node, { yOffset, ...options }),
      0
    );
}

export function getYTarget(
  yRoot: Y.XmlText,
  slateRoot: Node,
  path: Path
): YTarget {
  if (path.length === 0) {
    throw new Error('Path has to a have a length >= 1');
  }

  if (Text.isText(slateRoot)) {
    throw new Error('Cannot descent into slate text');
  }

  const [pathOffset, ...childPath] = path;

  const delta = yTextToInsertDelta(yRoot);
  const yOffset = slatePathOffsetToYOffset(slateRoot, pathOffset, {
    yParentDelta: delta,
  });

  const targetNode = slateRoot.children[pathOffset];
  const targetLength = getSlateNodeYLength(targetNode, {
    yParentDelta: delta,
    yOffset,
  });

  const targetDelta = sliceInsertDelta(delta, yOffset, targetLength);
  if (targetDelta.length > 1) {
    throw new Error("Path doesn't match yText, yTarget spans multiple nodes");
  }

  const yTarget = targetDelta[0]?.insert;
  if (childPath.length > 0) {
    if (!(yTarget instanceof Y.XmlText)) {
      throw new Error(
        "Path doesn't match yText, cannot descent into non-yText"
      );
    }

    return getYTarget(yTarget, targetNode, childPath);
  }

  return {
    yParent: yRoot,
    textRange: { start: yOffset, end: yOffset + targetLength },
    yTarget: yTarget instanceof Y.XmlText ? yTarget : undefined,
    slateParent: slateRoot,
    slateTarget: targetNode,
    targetDelta,
  };
}

export interface YOffsetToSlateLocationOptions {
  yParentDelta?: InsertDelta;
  association?: 'left' | 'right';
  mode?: 'default' | 'insert';
}

export function yOffsetToSlateLocation(
  parent: Ancestor,
  parentPath: Path,
  yOffset: number,
  options: YOffsetToSlateLocationOptions = {}
): Path | Point {
  const { association = 'right', mode = 'default', yParentDelta } = options;

  let currentOffset = 0;
  let lastNonEmptyPathOffset = 0;
  for (let pathOffset = 0; pathOffset < parent.children.length; pathOffset++) {
    const child = parent.children[pathOffset];
    const nodeLength = getSlateNodeYLength(child, {
      yParentDelta,
      yOffset: currentOffset,
    });

    if (nodeLength > 0) {
      lastNonEmptyPathOffset = pathOffset;
    }

    const endOffset = currentOffset + nodeLength;
    if (
      nodeLength > 0 &&
      (association === 'right' ? endOffset > yOffset : endOffset >= yOffset)
    ) {
      const path = [...parentPath, pathOffset];
      return Text.isText(child)
        ? {
            path,
            offset: yOffset - currentOffset,
          }
        : path;
    }

    currentOffset += nodeLength;
  }

  if (yOffset > currentOffset + (mode === 'insert' ? 1 : 0)) {
    throw new Error('yOffset out of bounds');
  }

  if (mode === 'insert') {
    return [...parentPath, parent.children.length];
  }

  const child = parent.children[lastNonEmptyPathOffset];
  const path = [...parentPath, lastNonEmptyPathOffset];
  return Text.isText(child) ? { path, offset: child.text.length } : path;
}

export function getSlatePath(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  yText: Y.XmlText
): Path {
  const yNodePath = [yText];
  while (yNodePath[0] !== sharedRoot) {
    const { parent: yParent } = yNodePath[0];

    if (!yParent) {
      throw new Error("yText isn't a descendant of root element");
    }

    if (!(yParent instanceof Y.XmlText)) {
      throw new Error('Unexpected y parent type');
    }

    yNodePath.unshift(yParent);
  }

  if (yNodePath.length < 2) {
    return [];
  }

  let slateParent = slateRoot;
  return yNodePath.reduce<Path>((path, yParent, idx) => {
    const yChild = yNodePath[idx + 1];
    if (!yChild) {
      return path;
    }

    let yOffset = 0;
    const currentDelta = yTextToInsertDelta(yParent);
    for (const element of currentDelta) {
      if (element.insert === yChild) {
        break;
      }

      yOffset += typeof element.insert === 'string' ? element.insert.length : 1;
    }

    if (Text.isText(slateParent)) {
      throw new Error('Cannot descent into slate text');
    }

    const location = yOffsetToSlateLocation(slateParent, path, yOffset, {
      yParentDelta: currentDelta,
    });
    const newPath = Path.isPath(location) ? location : location.path;
    const pathOffset = newPath[newPath.length - 1];
    slateParent = slateParent.children[pathOffset];
    return newPath;
  }, []);
}
