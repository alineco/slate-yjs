import * as Y from 'yjs';
import { DeltaInsert } from '../model/types';

/**
 * Represent empty text nodes using a character with a special attribute, since
 * Yjs doesn't support storing attributes on empty insertions.
 */
export const EMPTY_TEXT_ATTRIBUTE = '__slateYjsEmptyText';
const EMPTY_TEXT_CHAR = '\u200b'; // zero-width space

export function getEmptyTextInsert(
  attributes: Record<string, unknown> = {}
): DeltaInsert {
  return {
    insert: EMPTY_TEXT_CHAR,
    attributes: { ...attributes, [EMPTY_TEXT_ATTRIBUTE]: true },
  };
}

export function insertEmptyText(
  yText: Y.XmlText,
  index: number,
  attributes: Record<string, unknown> = {}
) {
  yText.insert(index, EMPTY_TEXT_CHAR, {
    ...attributes,
    [EMPTY_TEXT_ATTRIBUTE]: true,
  });
}

export function omitEmptyTextAttribute<
  T extends Record<string, unknown> | undefined
>(attributes: T) {
  if (!attributes) return attributes;
  return Object.fromEntries(
    Object.entries(attributes).filter(([k]) => k !== EMPTY_TEXT_ATTRIBUTE)
  ) as T;
}
