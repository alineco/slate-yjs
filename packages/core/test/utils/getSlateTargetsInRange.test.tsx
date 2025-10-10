/** @jsx jsx */
import { describe, it, expect } from 'vitest';
import { Editor, Element, Text } from 'slate';
import { jsx } from '../support/jsx';
import { yTextFactory } from '../support/utils';
import { yTextToInsertDelta } from '../../src/utils/delta';
import { getSlateTargetsInRange } from '../../src/applyToSlate/getSlateTargetsInRange';

describe('getSlateTargetsInRange', () => {
  describe('block-level', () => {
    const editor: Editor = (
      <editor>
        <unstyled>
          <unstyled />
          <unstyled />
          <unstyled />
          <unstyled />
        </unstyled>
      </editor>
    );

    const yParentDelta = yTextToInsertDelta(
      yTextFactory(editor.children[0] as Element)
    );

    it('targets no children', () => {
      const results = Array.from(
        getSlateTargetsInRange(editor, [0], yParentDelta, 0, 0)
      );
      expect(results).toEqual([]);
    });

    it('targets the first child', () => {
      const results = Array.from(
        getSlateTargetsInRange(editor, [0], yParentDelta, 0, 1)
      );
      expect(results).toEqual([[0, 0]]);
    });

    it('targets two children', () => {
      const results = Array.from(
        getSlateTargetsInRange(editor, [0], yParentDelta, 1, 3)
      );
      expect(results).toEqual([
        [0, 1],
        [0, 2],
      ]);
    });

    it('targets three children', () => {
      const results = Array.from(
        getSlateTargetsInRange(editor, [0], yParentDelta, 1, 4)
      );
      expect(results).toEqual([
        [0, 1],
        [0, 2],
        [0, 3],
      ]);
    });
  });

  describe('inline-level', () => {
    /**
     * Comments denote the yOffset at each point. The bracketed number is the
     * yOffset if legacy text nodes are used.
     */
    const editor: Editor = (
      <editor>
        <unstyled>
          {/* 0 */}
          <text>one</text>
          {/* 3 */}
          <text bold>two</text>
          {/* 6 */}
          <text italic />
          {/* 7 (6) */}
          <text />
          {/* 8 (6) */}
          <text bold>four</text>
          {/* 12 (10) */}
          <text italic>five</text>
          {/* 16 (14) */}
          <text italic>six</text>
          {/* 19 (17) */}
          <link />
          {/* 20 (17) */}
          <text>seven</text>
          {/* 25 (22) */}
        </unstyled>
      </editor>
    );

    const yParentDelta = yTextToInsertDelta(
      yTextFactory(editor.children[0] as Element)
    );

    describe('non-empty text', () => {
      it('targets no children', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 1, 1)
        );
        expect(results).toEqual([]);
      });

      it('targets whole node', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 0, 3)
        );
        expect(results).toEqual([[0, 0]]);
      });

      it('targets multiple whole nodes', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 8, 16)
        );
        expect(results).toEqual([
          [0, 4],
          [0, 5],
        ]);
      });

      it('targets partial node at start', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 12, 14)
        );
        expect(results).toEqual([
          {
            anchor: { path: [0, 5], offset: 0 },
            focus: { path: [0, 5], offset: 2 },
          },
        ]);
      });

      it('targets partial node at end', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 14, 16)
        );
        expect(results).toEqual([
          {
            anchor: { path: [0, 5], offset: 2 },
            focus: { path: [0, 5], offset: 4 },
          },
        ]);
      });

      it('targets partial node in middle', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 13, 15)
        );
        expect(results).toEqual([
          {
            anchor: { path: [0, 5], offset: 1 },
            focus: { path: [0, 5], offset: 3 },
          },
        ]);
      });

      it('targets two partial nodes', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 13, 17)
        );
        expect(results).toEqual([
          {
            anchor: { path: [0, 5], offset: 1 },
            focus: { path: [0, 5], offset: 4 },
          },
          {
            anchor: { path: [0, 6], offset: 0 },
            focus: { path: [0, 6], offset: 1 },
          },
        ]);
      });

      it('targets two partial nodes and one whole node between them', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 9, 17)
        );
        expect(results).toEqual([
          {
            anchor: { path: [0, 4], offset: 1 },
            focus: { path: [0, 4], offset: 4 },
          },
          [0, 5],
          {
            anchor: { path: [0, 6], offset: 0 },
            focus: { path: [0, 6], offset: 1 },
          },
        ]);
      });
    });

    describe('empty text', () => {
      it('targets no children before', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 6, 6)
        );
        expect(results).toEqual([]);
      });

      it('targets no children after', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 7, 7)
        );
        expect(results).toEqual([]);
      });

      it('targets empty text node', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 6, 7)
        );
        expect(results).toEqual([[0, 2]]);
      });

      it('targets two empty text nodes', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 6, 8)
        );
        expect(results).toEqual([
          [0, 2],
          [0, 3],
        ]);
      });
    });

    describe('inline element', () => {
      it('targets no children before', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 19, 19)
        );
        expect(results).toEqual([]);
      });

      it('targets no children after', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 20, 20)
        );
        expect(results).toEqual([]);
      });

      it('targets inline element', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 19, 20)
        );
        expect(results).toEqual([[0, 7]]);
      });
    });

    describe('legacy empty text', () => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const yParentDelta = yTextToInsertDelta(
        yTextFactory(
          (editor.children[0] as Element).children.filter(
            (n) => !Text.isText(n) || n.text.length
          )
        )
      );

      it('targets no children on legacy empty text node', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 6, 6)
        );
        expect(results).toEqual([]);
      });

      it('targets nodes following legacy empty text nodes', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 6, 14)
        );
        expect(results).toEqual([
          [0, 4],
          [0, 5],
        ]);
      });

      it('targets ranges of nodes including empty text nodes', () => {
        const results = Array.from(
          getSlateTargetsInRange(editor, [0], yParentDelta, 4, 7)
        );
        expect(results).toEqual([
          {
            anchor: { path: [0, 1], offset: 1 },
            focus: { path: [0, 1], offset: 3 },
          },
          [0, 2],
          [0, 3],
          {
            anchor: { path: [0, 4], offset: 0 },
            focus: { path: [0, 4], offset: 1 },
          },
        ]);
      });
    });
  });
});
