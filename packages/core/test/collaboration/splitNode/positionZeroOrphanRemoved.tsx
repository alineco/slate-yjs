/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';
import { YjsEditor } from '../../../src';

// Adjustment 5 — production op log replayed verbatim.
//
// Captured from `aline:redline:apply` in production. Two logical
// phases (applyAlineChanges, then insertSuggestionMarkersFromRange-
// Markers) replace the suggestion-marker void elements bracketing
// the redlined text and then re-`set_node` the now-shifted "fast"
// text. On the local editor this produces the correct tree; the
// streamed peer sees the trailing `set_node` land on the wrong
// Y.XmlText.
//
// No `split_node` appears in the real log — the prior split-at-0
// hypothesis was a red herring. The churn comes from the marker
// remove+reinsert pair plus the empty-text remove that precedes it.

export const input = (
  <editor>
    <unstyled>
      <text suggestedEdits={[]}>The </text>
      <text suggestedEdits={['del']}>quick</text>
      <marker markerId={1}>
        <text suggestedEdits={[]} />
      </marker>
      <text suggestedEdits={['del', 'ins']}>fast</text>
      <text suggestedEdits={['ins']}>slow</text>
      <marker markerId={1}>
        <text suggestedEdits={[]} />
      </marker>
      <text suggestedEdits={[]}> brown fox jumped over the lazy dog.</text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text suggestedEdits={[]}>The </text>
      <text suggestedEdits={['del']}>quick</text>
      <marker markerId={2}>
        <text suggestedEdits={[]} />
      </marker>
      <text suggestedEdits={['del2', 'ins2']}>fast</text>
      <text suggestedEdits={['ins2']}>hyperactive</text>
      <marker markerId={2}>
        <text suggestedEdits={[]} />
      </marker>
      <text suggestedEdits={[]}> brown fox jumped over the lazy dog.</text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Editor.withoutNormalizing(editor, () => {
    // Phase 1 — applyAlineChanges (production ops 1-3; op 4 is selection).

    // op 1: insert "hyperactive" before " brown fox..." at [0, 6]
    editor.apply({
      type: 'insert_node',
      path: [0, 6],
      node: { text: 'hyperactive', suggestedEdits: ['ins2'] },
    });

    // op 2: empty "slow" via remove_text at [0, 4]
    editor.apply({
      type: 'remove_text',
      path: [0, 4],
      offset: 0,
      text: 'slow',
    });

    // op 3: clear suggestedEdits array on the now-empty "slow" leaf
    editor.apply({
      type: 'set_node',
      path: [0, 4],
      properties: { suggestedEdits: ['ins'] },
      newProperties: { suggestedEdits: [] },
    });

    // Flush phase 1 to Yjs as its own transaction so the streamed peer
    // sees two separate updateV2 events (mirroring production, where
    // applyAlineChanges and insertSuggestionMarkersFromRangeMarkers
    // are independent callers). We stay inside `withoutNormalizing`
    // so slate's normalize does NOT run between phases — that would
    // strip the empty leaf at [0, 4] and break phase 2's paths.
    YjsEditor.flushLocalChanges(editor as Editor & YjsEditor);

    // Phase 2 — insertSuggestionMarkersFromRangeMarkers (production ops 5-10).

    // op 5: remove the now-empty leaf at [0, 4]
    editor.apply({
      type: 'remove_node',
      path: [0, 4],
      node: { text: '', suggestedEdits: [] },
    });

    // op 6: remove old marker end (was [0, 5], shifted to [0, 4])
    editor.apply({
      type: 'remove_node',
      path: [0, 4],
      node: {
        type: 'marker',
        markerId: 1,
        children: [{ text: '', suggestedEdits: [] }],
      },
    });

    // op 7: remove old marker start at [0, 2]
    editor.apply({
      type: 'remove_node',
      path: [0, 2],
      node: {
        type: 'marker',
        markerId: 1,
        children: [{ text: '', suggestedEdits: [] }],
      },
    });

    // op 8: insert new marker end (markerId=2) at [0, 4]
    editor.apply({
      type: 'insert_node',
      path: [0, 4],
      node: {
        type: 'marker',
        markerId: 2,
        children: [{ text: '', suggestedEdits: [] }],
      },
    });

    // op 9: insert new marker start (markerId=2) at [0, 2]
    editor.apply({
      type: 'insert_node',
      path: [0, 2],
      node: {
        type: 'marker',
        markerId: 2,
        children: [{ text: '', suggestedEdits: [] }],
      },
    });

    // op 10: set new suggestedEdits on "fast" — now at the shifted [0, 3].
    //        This is the op that lands on the wrong Y.XmlText in production.
    editor.apply({
      type: 'set_node',
      path: [0, 3],
      properties: { suggestedEdits: ['del', 'ins'] },
      newProperties: { suggestedEdits: ['del2', 'ins2'] },
    });
  });
}

