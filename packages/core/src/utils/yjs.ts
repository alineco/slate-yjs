import * as Y from 'yjs';
import { RecursiveDeltaInsert } from '../model/types';
import { yTextToInsertDelta } from './delta';
import { isEmptyTextAttribute, hasEmptyTextAttribute } from './emptyText';
import { EMPTY_TEXT_PREFIX, STORED_POSITION_PREFIX } from './constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assertDocumentAttachment<T extends Y.AbstractType<any>>(
  sharedType: T
): asserts sharedType is T & { doc: NonNullable<T['doc']> } {
  if (!sharedType.doc) {
    throw new Error("shared type isn't attached to a document");
  }
}

/**
 * Serialize a Y text to a plain object for debugging and testing purposes.
 */
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
