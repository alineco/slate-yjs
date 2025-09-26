import * as Y from 'yjs';
import { Delta } from '../model/types';
import { yTextToInsertDelta } from './delta';

export type CloneWeakMap = WeakMap<Y.XmlText, Y.XmlText>;

export function cloneDeltaDeep<T extends Delta>(
  delta: T,
  { cloneMap }: { cloneMap?: CloneWeakMap } = {}
): T {
  return delta.map((element): typeof element => {
    if ('insert' in element && element.insert instanceof Y.XmlText) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return { ...element, insert: cloneDeep(element.insert, { cloneMap }) };
    }

    return element;
  }) as typeof delta;
}

export function cloneDeep(
  yText: Y.XmlText,
  {
    destination = new Y.XmlText(),
    cloneMap,
  }: { destination?: Y.XmlText; cloneMap?: CloneWeakMap } = {}
): Y.XmlText {
  const attributes = yText.getAttributes();
  Object.entries(attributes).forEach(([key, value]) => {
    destination.setAttribute(key, value);
  });

  destination.applyDelta(
    cloneDeltaDeep(yTextToInsertDelta(yText), { cloneMap }),
    {
      sanitize: false,
    }
  );

  cloneMap?.set(yText, destination);

  return destination;
}
