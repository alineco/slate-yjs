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
import { getProperties } from './slate';
import { deepEquals } from './object';

export interface LocationRange {
  start: Path | Point;
  end: Path | Point;
}

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

export function* slateChildrenInRange(
  parent: Ancestor,
  parentPath: Path,
  { start, end }: LocationRange
): Generator<Path | Range> {
  const startIsPath = Path.isPath(start);
  const endIsPath = Path.isPath(end);

  const startPath = startIsPath ? start : start.path;
  const endPath = endIsPath ? end : end.path;

  const startPathOffset = startPath[startPath.length - 1];
  const endPathOffset = endPath[endPath.length - 1];

  // Single node
  if (startPathOffset === endPathOffset) {
    if (startIsPath || endIsPath) {
      yield startPath;
    } else {
      const child = parent.children[startPathOffset];
      if (!Text.isText(child)) throw new Error('Expected text');
      const { length } = child.text;

      if (start.offset === 0 && end.offset === length) {
        // The entire node is covered, so return its path
        yield startPath;
      } else if (start.offset === end.offset) {
        // The range is empty, so return nothing
      } else {
        yield { anchor: start, focus: end };
      }
    }

    return;
  }

  // Distinct nodes
  for (let i = endPathOffset; i >= startPathOffset; i--) {
    const path = [...parentPath, i];
    const isStartNode = i === startPathOffset;
    const isEndNode = i === endPathOffset;

    // Return the entirety of nodes between the start and end nodes
    if (!isStartNode && !isEndNode) {
      yield path;
      continue;
    }

    const child = parent.children[i];
    if (!Text.isText(child)) throw new Error('Expected text');
    const { length } = child.text;

    /**
     * If the start location is a path or the start of a node, return the entire
     * node.
     */
    if (isStartNode && (startIsPath || start.offset === 0)) {
      yield path;
      continue;
    }

    /**
     * If the end location is a path or the end of a node, return the entire
     * node.
     */
    if (isEndNode && (endIsPath || end.offset === length)) {
      yield path;
      continue;
    }

    // If the start point is at the end of the node, skip it
    if (isStartNode && !startIsPath && start.offset < length) {
      yield { anchor: start, focus: { path, offset: length } };
      continue;
    }

    // If the end point is at the start of the node, skip it
    if (isEndNode && !endIsPath && end.offset > 0) {
      yield { anchor: { path, offset: 0 }, focus: end };
      continue;
    }
  }
}

export function getInsertTextPoint(
  editor: Editor,
  at: Path | Point,
  attributes: Record<string, unknown>
): Point | null {
  const isPoint = Point.isPoint(at);
  const atPath = isPoint ? at.path : at;
  const node = Node.has(editor, atPath) ? Node.get(editor, atPath) : null;

  const isSuitable = (candidate: Node) =>
    Text.isText(candidate) && deepEquals(getProperties(candidate), attributes);

  if (isPoint && node && isSuitable(node)) return at;

  const canCheckPrevious =
    Path.hasPrevious(atPath) && (!isPoint || at.offset === 0);

  if (canCheckPrevious) {
    const previousPath = Path.previous(atPath);
    const previousNode = Node.get(editor, previousPath);
    if (isSuitable(previousNode)) return Editor.end(editor, previousPath);
  }

  const canCheckNext = isPoint && Editor.isEnd(editor, at, atPath);

  if (canCheckNext) {
    const nextPath = Path.next(atPath);
    const nextNode = Node.has(editor, nextPath)
      ? Node.get(editor, nextPath)
      : null;
    if (nextNode && isSuitable(nextNode)) return Editor.start(editor, nextPath);
  }

  return null;
}
