import * as Y from 'yjs';
import { DeltaInsert, InsertDelta } from '../model/types';

/**
 * Represent empty text nodes using a character with a special attribute, since
 * Yjs doesn't support storing attributes on empty insertions.
 */
export const EMPTY_TEXT_PREFIX = '__slateYjsEmptyText_';
const EMPTY_TEXT_CHAR = '\u200b'; // zero-width space

export function isEmptyTextAttribute(key: string) {
  return key.startsWith(EMPTY_TEXT_PREFIX);
}

export function hasEmptyTextAttribute(
  attributes: Record<string, unknown> | undefined
) {
  return !!attributes && Object.keys(attributes).some(isEmptyTextAttribute);
}

export function createEmptyTextAttribute() {
  // Use a random suffix to prevent Yjs from merging multiple empty text nodes
  const randomId = Math.random().toString().slice(2);
  return { [EMPTY_TEXT_PREFIX + randomId]: true };
}

export function getEmptyTextInsert(
  attributes: Record<string, unknown> = {}
): DeltaInsert {
  return {
    insert: EMPTY_TEXT_CHAR,
    attributes: { ...attributes, ...createEmptyTextAttribute() },
  };
}

export function insertEmptyText(
  yText: Y.XmlText,
  index: number,
  attributes: Record<string, unknown> = {}
) {
  yText.insert(index, EMPTY_TEXT_CHAR, {
    ...attributes,
    ...createEmptyTextAttribute(),
  });
}

export function omitEmptyTextAttribute<
  T extends Record<string, unknown> | undefined
>(attributes: T) {
  if (!attributes) return attributes;
  return Object.fromEntries(
    Object.entries(attributes).filter(([k]) => !isEmptyTextAttribute(k))
  ) as T;
}

export function isDeltaInsertEmptyText({ attributes }: DeltaInsert): boolean {
  return hasEmptyTextAttribute(attributes);
}

export function isInsertDeltaEmptyText([deltaInsert]: InsertDelta): boolean {
  return !!deltaInsert && isDeltaInsertEmptyText(deltaInsert);
}
