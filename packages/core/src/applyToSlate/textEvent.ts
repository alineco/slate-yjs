import { Editor, Path, Text, Transforms } from 'slate';
import * as Y from 'yjs';
import { Delta } from '../model/types';
import { deltaInsertToSlateNode } from '../utils/convert';
import { getSlatePath } from '../utils/location';
import { omitEmptyTextAttribute } from '../utils/emptyText';
import { ClonedSharedRoot } from '../utils/ClonedSharedRoot';
import { yTextToInsertDelta } from '../utils/delta';
import { getSlateTargetsInRange } from './getSlateTargetsInRange';
import { getInsertMethod } from './getInsertMethod';

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
  clonedSharedRoot: ClonedSharedRoot,
  editor: Editor,
  event: Y.YTextEvent
) {
  const { target: newTarget, changes } = event;
  const delta = event.delta as Delta;

  if (!(newTarget instanceof Y.XmlText)) {
    throw new Error('Unexpected target node type');
  }

  const prevTarget = clonedSharedRoot.getCloned(newTarget);
  const slatePath = getSlatePath(
    clonedSharedRoot.sharedRoot,
    editor,
    prevTarget
  );

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
