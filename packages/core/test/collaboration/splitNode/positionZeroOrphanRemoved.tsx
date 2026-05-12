/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../support/jsx';

// Reproduction for a slate→Yjs→slate sync corruption that occurs when a
// `split_node` at `position: 0` is followed (in the same un-normalized
// batch) by a `remove_node` of the resulting empty leaf.
//
// Slate's in-memory state after the three ops below is exactly the
// `expected` tree — the split is a no-op structurally (leading half has
// zero chars, then we remove it). But applying the same ops through
// slate-yjs produces a different tree on the receiving side: subsequent
// ops downstream of the split land on the wrong Y.XmlText. A *fresh*
// load of the Yjs document is correct — the corruption is in the
// in-memory slate ← Yjs translation, not the persisted state.
//
// Real-world source: Slate's `splitTextAtEdges` forces an `always: true`
// split whenever a range endpoint sits at offset 0 of a non-empty text
// node. That op pair (split-at-position-0 + cleanup of the orphan empty
// leaf) appears in every redline that inserts new text at the start of
// an existing text node.

export const input = (
  <editor>
    <unstyled>
      <text>before </text>
      <text>after</text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text>before </text>
      <text bold>INSERT</text>
      <text>after</text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Editor.withoutNormalizing(editor, () => {
    // 1. Insert a NEW bolded text node between "before " and "after".
    editor.apply({
      type: 'insert_node',
      path: [0, 1],
      node: { text: 'INSERT', bold: true },
    });
    // Tree: [0]="before ", [1]="INSERT"(bold), [2]="after"

    // 2. Split [0, 1] at position 0 with `bold` carried in `properties`.
    //    The leading half is 0 chars; slate's `apply` produces an empty
    //    leaf at [0, 1] that inherits "INSERT"'s properties, and shifts
    //    "INSERT" to [0, 2].
    editor.apply({
      type: 'split_node',
      path: [0, 1],
      position: 0,
      properties: { bold: true },
    });
    // Tree: [0]="before ", [1]="" (bold orphan), [2]="INSERT"(bold),
    //       [3]="after"

    // 3. Remove the orphan empty leaf.
    editor.apply({
      type: 'remove_node',
      path: [0, 1],
      node: { text: '', bold: true },
    });
    // Tree: [0]="before ", [1]="INSERT"(bold), [2]="after" — matches
    // `expected`.
  });
}
