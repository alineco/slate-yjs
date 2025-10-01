import * as Y from 'yjs';
import { cloneDeep, cloneDeltaDeep, CloneWeakMap } from './clone';
import { Delta } from '../model/types';

export class ClonedSharedRoot {
  sharedRoot: Y.XmlText;

  /** A map from original shared types to their cloned versions. */
  private sharedTypeMap: CloneWeakMap = new WeakMap();

  constructor(originalSharedRoot: Y.XmlText) {
    const doc = new Y.Doc();
    this.sharedRoot = doc.get('clonedSharedRoot', Y.XmlText) as Y.XmlText;
    cloneDeep(originalSharedRoot, {
      destination: this.sharedRoot,
      cloneMap: this.sharedTypeMap,
    });
  }

  getCloned(original: Y.XmlText): Y.XmlText {
    const cloned = this.sharedTypeMap.get(original);
    if (!cloned) throw new Error('Y text without corresponding cloned text');
    return cloned;
  }

  applyEvent(event: Y.YEvent<Y.XmlText>) {
    const {
      target: originalTarget,
      changes: { delta, keys },
    } = event;

    const clonedTarget = this.getCloned(originalTarget);

    const clonedDelta = cloneDeltaDeep(delta as Delta, {
      cloneMap: this.sharedTypeMap,
    });

    console.log({ delta, clonedDelta });

    clonedTarget.applyDelta(clonedDelta, { sanitize: false });

    for (const key of keys.keys()) {
      clonedTarget.setAttribute(key, originalTarget.getAttribute(key));
    }
  }
}
