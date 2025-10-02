import { Element, Node, Text } from 'slate';
import * as Y from 'yjs';
import { DeltaInsert, InsertDelta } from '../model/types';
import { isInsertDeltaEmptyText, yTextToInsertDelta } from './delta';
import { getProperties } from './slate';
import { getEmptyTextInsert, omitEmptyTextAttribute } from './emptyText';

export interface DeltaInsertToSlateNodeOptions {
  /**
   * If true, empty yTexts will be converted to empty Slate elements, with no
   * children. By default, empty text nodes will be inserted for empty yTexts.
   * @default false
   */
  allowEmptyElements?: boolean;
}

export function yTextToSlateElement(
  yText: Y.XmlText,
  options: DeltaInsertToSlateNodeOptions = {}
): Element {
  const { allowEmptyElements = false } = options;
  const delta = yTextToInsertDelta(yText);

  const children =
    allowEmptyElements || delta.length > 0
      ? // eslint-disable-next-line @typescript-eslint/no-use-before-define
        delta.map((insert) => deltaInsertToSlateNode(insert, options))
      : [{ text: '' }];
  const attributes = yText.getAttributes();

  return { ...attributes, children };
}

export function deltaInsertToSlateNode(
  insert: DeltaInsert,
  options: DeltaInsertToSlateNodeOptions = {}
): Node {
  if (typeof insert.insert === 'string') {
    if (isInsertDeltaEmptyText(insert)) {
      return { ...omitEmptyTextAttribute(insert.attributes), text: '' };
    }

    return { ...insert.attributes, text: insert.insert };
  }

  return yTextToSlateElement(insert.insert, options);
}

export function slateNodesToInsertDelta(nodes: Node[]): InsertDelta {
  return nodes.map((node) => {
    if (Text.isText(node)) {
      const { text } = node;
      const attributes = getProperties(node);
      return text.length
        ? { insert: text, attributes }
        : getEmptyTextInsert(attributes);
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return { insert: slateElementToYText(node) };
  });
}

export function slateElementToYText({
  children,
  ...attributes
}: Element): Y.XmlText {
  const yElement = new Y.XmlText();

  Object.entries(attributes).forEach(([key, value]) => {
    yElement.setAttribute(key, value);
  });

  yElement.applyDelta(slateNodesToInsertDelta(children), { sanitize: false });
  return yElement;
}
