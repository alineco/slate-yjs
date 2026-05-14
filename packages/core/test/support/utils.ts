import * as Y from 'yjs';
import { Ancestor, Descendant } from 'slate';
import { DeltaInsert } from '../../src/model/types';
import { yTextToInsertDelta } from '../../src/utils/delta';
import { slateNodesToInsertDelta } from '../../src';
import { STORED_POSITION_PREFIX } from '../../src/utils/position';
import {
  EMPTY_TEXT_PREFIX,
  hasEmptyTextAttribute,
  isEmptyTextAttribute,
} from '../../src/utils/emptyText';

interface RecursiveDeltaInsert extends Omit<DeltaInsert, 'insert'> {
  insert: string | RecursiveInsertDelta | RecursiveDeltaInsert;
}

type RecursiveInsertDelta = RecursiveDeltaInsert[];

export const YJS_VERSION =
  'version' in Y && Y.version === 'oldest' ? 'oldest' : 'latest';

export function inspectYText(yText: Y.XmlText): RecursiveDeltaInsert {
  const delta = yTextToInsertDelta(yText);

  const mappedDelta = delta.map(({ insert, attributes }) => {
    if (typeof insert !== 'string') return inspectYText(insert);
    if (!attributes) return { insert };

    const filteredAttributes = Object.fromEntries(
      Object.entries(attributes).filter(([key]) => !isEmptyTextAttribute(key))
    );

    // Do not include random empty text attribute IDs
    if (hasEmptyTextAttribute(attributes)) {
      filteredAttributes[`${EMPTY_TEXT_PREFIX}<id>`] = true;
    }

    return { insert, attributes: filteredAttributes };
  });

  const attributes = yText.getAttributes();

  // Do not include stored position attributes
  const filteredAttributes = Object.fromEntries(
    Object.entries(attributes).filter(
      ([key]) => !key.startsWith(STORED_POSITION_PREFIX)
    )
  );

  return { attributes: filteredAttributes, insert: mappedDelta };
}

export function yTextFactory(
  ancestorOrChildren: Ancestor | Descendant[],
  doc = new Y.Doc()
): Y.XmlText {
  const sharedType = doc.get('sharedRoot', Y.XmlText) as Y.XmlText;

  if (sharedType.toDelta().length === 0) {
    const children = Array.isArray(ancestorOrChildren)
      ? ancestorOrChildren
      : ancestorOrChildren.children;
    sharedType.applyDelta(slateNodesToInsertDelta(children));
  }

  return sharedType;
}

export async function wait(ms = 0) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
