import { Editor, Node, Path, Range } from 'slate';
import { InsertDelta } from '../model/types';
import { getSlateNodeYLength } from '../utils/location';

/**
 * Determine which Slate paths and ranges are affected by a retain or delete
 * delta.
 */
export function* getSlateTargetsInRange(
  editor: Editor,
  parentPath: Path,
  yParentDelta: InsertDelta,
  yStart: number,
  yEnd: number
): Generator<Path | Range> {
  let currentOffset = 0;
  let atLeastOneMatch = false;

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

    // Return legacy empty text nodes that are within the range
    if (atLeastOneMatch && yLength === 0) {
      yield path;
      continue;
    }

    // Skip nodes that are entirely before yStart
    if (relativeYStart >= yLength) continue;

    const includesStart = relativeYStart === 0;
    const includesEnd = relativeYEnd >= yLength;

    // If the entire node is included, return just its path
    if (includesStart && includesEnd) {
      atLeastOneMatch = true;
      yield path;
      continue;
    }

    const clampedEnd = Math.min(yLength, relativeYEnd);

    // If the range is empty, return nothing
    if (relativeYStart === clampedEnd) continue;

    /**
     * Since only part of the node is included, it must be a non-empty text node
     * (since all other nodes are indivisible). This means that Yjs offsets can
     * be treated as Slate offsets.
     */
    atLeastOneMatch = true;
    yield {
      anchor: { path, offset: relativeYStart },
      focus: { path, offset: clampedEnd },
    };
  }
}
