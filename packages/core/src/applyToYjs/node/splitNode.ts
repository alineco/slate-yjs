import { Node, SplitNodeOperation, Text } from 'slate';
import * as Y from 'yjs';
import { cloneDeltaDeep } from '../../utils/clone';
import { sliceInsertDelta, yTextToInsertDelta } from '../../utils/delta';
import { getSlateNodeYLength, getYTarget } from '../../utils/location';
import {
  getStoredPositionsInDeltaAbsolute,
  restoreStoredPositionsWithDeltaAbsolute,
} from '../../utils/position';
import { EMPTY_TEXT_ATTRIBUTE, insertEmptyText } from '../../utils/emptyText';

export function splitNode(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  op: SplitNodeOperation
): void {
  const target = getYTarget(sharedRoot, slateRoot, op.path);

  if (!target.slateTarget) {
    throw new Error('Y target without corresponding slate node');
  }

  if (!target.yTarget) {
    if (!Text.isText(target.slateTarget)) {
      throw new Error('Mismatch node type between y target and slate node');
    }

    const oldProperties: Record<string, unknown> = {};
    const unset: Record<string, null> = {};

    target.targetDelta.forEach((element) => {
      if (element.attributes) {
        Object.entries(element.attributes).forEach(([key, value]) => {
          if (key !== EMPTY_TEXT_ATTRIBUTE) {
            oldProperties[key] = value;
            unset[key] = null;
          }
        });
      }
    });

    let ySplitOffset = target.textRange.start + op.position;
    let length = target.textRange.end - ySplitOffset;

    if (op.position === 0) {
      insertEmptyText(target.yParent, ySplitOffset, oldProperties);
      ySplitOffset++;
    }

    if (length === 0) {
      insertEmptyText(target.yParent, ySplitOffset);
      length++;
    }

    target.yParent.format(ySplitOffset, length, {
      ...unset,
      ...op.properties,
    });

    return;
  }

  if (Text.isText(target.slateTarget)) {
    throw new Error('Mismatch node type between y target and slate node');
  }

  const splitTarget = getYTarget(target.yTarget, target.slateTarget, [
    op.position,
  ]);

  const yParentDelta = yTextToInsertDelta(target.yTarget);

  const ySplitOffset = target.slateTarget.children.slice(0, op.position).reduce(
    (length, child) =>
      length +
      getSlateNodeYLength(child, {
        yParentDelta,
        yOffset: length,
      }),
    0
  );

  const length = target.slateTarget.children.reduce(
    (current, child) =>
      current +
      getSlateNodeYLength(child, {
        yParentDelta,
        yOffset: current,
      }),
    0
  );

  const splitDelta = sliceInsertDelta(
    yTextToInsertDelta(target.yTarget),
    ySplitOffset,
    length - ySplitOffset
  );
  const clonedDelta = cloneDeltaDeep(splitDelta);

  const storedPositions = getStoredPositionsInDeltaAbsolute(
    sharedRoot,
    target.yTarget,
    splitDelta,
    ySplitOffset
  );

  const toInsert = new Y.XmlText();
  toInsert.applyDelta(clonedDelta, {
    sanitize: false,
  });

  Object.entries(op.properties).forEach(([key, value]) => {
    toInsert.setAttribute(key, value);
  });

  target.yTarget.delete(
    splitTarget.textRange.start,
    target.yTarget.length - splitTarget.textRange.start
  );

  target.yParent.insertEmbed(target.textRange.end, toInsert);

  restoreStoredPositionsWithDeltaAbsolute(
    sharedRoot,
    toInsert,
    storedPositions,
    clonedDelta,
    0,
    ySplitOffset
  );
}
