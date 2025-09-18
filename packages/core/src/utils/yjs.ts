import * as Y from 'yjs';

/**
 * Represent empty text nodes using a character with a special attribute, since
 * Yjs doesn't support storing attributes on empty insertions.
 */
export const emptyTextAttribute = '_slateYjsEmptyLeaf';
export const emptyTextChar = '&'; // TODO: Use '\u200b'; // zero-width space

export function omitEmptyTextAttribute<
  T extends Record<string, unknown> | undefined
>(attributes: T) {
  if (!attributes) return attributes;
  return Object.fromEntries(
    Object.entries(attributes).filter(([k]) => k !== emptyTextAttribute)
  ) as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assertDocumentAttachment<T extends Y.AbstractType<any>>(
  sharedType: T
): asserts sharedType is T & { doc: NonNullable<T['doc']> } {
  if (!sharedType.doc) {
    throw new Error("shared type isn't attached to a document");
  }
}
