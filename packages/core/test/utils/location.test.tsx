/** @jsx jsx */
import { describe, it, expect } from 'vitest';
import { Ancestor, Descendant } from 'slate';
import { jsx } from '../../../../support/jsx';
import { yTextFactory } from '../yTextFactory';
import { yOffsetToSlateOffsets } from '../../src/utils/location';
import { yTextToInsertDelta } from '../../src/utils/delta';

describe('yOffsetToSlateOffsets', () => {
  describe('with block children', () => {
    const content: Descendant[] = (
      <fragment>
        <unstyled>one</unstyled>
        <unstyled>two</unstyled>
        <unstyled>three</unstyled>
      </fragment>
    );

    const parent: Ancestor = <unstyled>{content}</unstyled>;
    const yParentDelta = yTextToInsertDelta(yTextFactory(content));

    it('returns the first child', () => {
      const [pathOffset] = yOffsetToSlateOffsets(parent, 0, {
        yParentDelta,
      });
      expect(pathOffset).toBe(0);
    });

    it('returns the first child with assoc < 0', () => {
      const [pathOffset] = yOffsetToSlateOffsets(parent, 1, {
        yParentDelta,
        assoc: -1,
      });
      expect(pathOffset).toBe(0);
    });

    it('returns the second child', () => {
      const [pathOffset] = yOffsetToSlateOffsets(parent, 1, {
        yParentDelta,
      });
      expect(pathOffset).toBe(1);
    });

    it('returns the second child with assoc < 0', () => {
      const [pathOffset] = yOffsetToSlateOffsets(parent, 2, {
        yParentDelta,
        assoc: -1,
      });
      expect(pathOffset).toBe(1);
    });

    it('returns the last child', () => {
      const [pathOffset] = yOffsetToSlateOffsets(parent, 2, {
        yParentDelta,
      });
      expect(pathOffset).toBe(2);
    });

    it('returns the last child with assoc < 0', () => {
      const [pathOffset] = yOffsetToSlateOffsets(parent, 3, {
        yParentDelta,
        assoc: -1,
      });
      expect(pathOffset).toBe(2);
    });
  });

  describe('with non-empty text children', () => {
    const content: Descendant[] = (
      <fragment>
        <text bold>one</text>
        <text italic>two</text>
        <text bold>three</text>
      </fragment>
    );

    const parent: Ancestor = <unstyled>{content}</unstyled>;
    const yParentDelta = yTextToInsertDelta(yTextFactory(content));

    it('returns a point at the start of the first text node', () => {
      const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, 0, {
        yParentDelta,
      });
      expect([pathOffset, textOffset]).toEqual([0, 0]);
    });

    it('returns a point at the end of the first text node', () => {
      const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, 3, {
        yParentDelta,
        assoc: -1,
      });
      expect([pathOffset, textOffset]).toEqual([0, 3]);
    });

    it('returns a point at the start of the middle text node', () => {
      const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, 3, {
        yParentDelta,
      });
      expect([pathOffset, textOffset]).toEqual([1, 0]);
    });

    it('returns a point in the middle of a text node', () => {
      const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, 5, {
        yParentDelta,
      });
      expect([pathOffset, textOffset]).toEqual([1, 2]);
    });

    it('returns a point at the end of the middle text node', () => {
      const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, 6, {
        yParentDelta,
        assoc: -1,
      });
      expect([pathOffset, textOffset]).toEqual([1, 3]);
    });

    it('returns a point at the end of the last text node', () => {
      const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, 11, {
        yParentDelta,
      });
      expect([pathOffset, textOffset]).toEqual([2, 5]);
    });
  });

  describe('with empty text and inline element children', () => {
    const content: Descendant[] = (
      <fragment>
        <text bold />
        <link>link</link>
        <text italic />
      </fragment>
    );

    const parent: Ancestor = <unstyled>{content}</unstyled>;
    const yParentDelta = yTextToInsertDelta(yTextFactory(content));

    it('returns the first empty text node', () => {
      const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, 0, {
        yParentDelta,
      });
      expect([pathOffset, textOffset]).toEqual([0, 0]);
    });

    it('returns the first empty text node with assoc < 0', () => {
      const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, 1, {
        yParentDelta,
        assoc: -1,
      });
      expect([pathOffset, textOffset]).toEqual([0, 0]);
    });

    it('returns the inline element', () => {
      const [pathOffset] = yOffsetToSlateOffsets(parent, 1, {
        yParentDelta,
      });
      expect(pathOffset).toEqual(1);
    });

    it('returns the inline element with assoc < 0', () => {
      const [pathOffset] = yOffsetToSlateOffsets(parent, 2, {
        yParentDelta,
        assoc: -1,
      });
      expect(pathOffset).toEqual(1);
    });

    it('returns the second empty text node', () => {
      const [pathOffset] = yOffsetToSlateOffsets(parent, 2, {
        yParentDelta,
      });
      expect(pathOffset).toEqual(2);
    });

    it('returns the second empty text node with assoc < 0', () => {
      const [pathOffset] = yOffsetToSlateOffsets(parent, 3, {
        yParentDelta,
        assoc: -1,
      });
      expect(pathOffset).toEqual(2);
    });
  });

  describe('with legacy empty text and inline element children', () => {
    const content: Descendant[] = (
      <fragment>
        <text bold />
        <link>link</link>
        <text italic />
      </fragment>
    );

    const yContent: Descendant[] = (
      <fragment>
        {/* No text node in Yjs model */}
        <link>link</link>
        {/* No text node in Yjs model */}
      </fragment>
    );

    const parent: Ancestor = <unstyled>{content}</unstyled>;
    const yParentDelta = yTextToInsertDelta(yTextFactory(yContent));

    it('returns the inline element', () => {
      const [pathOffset] = yOffsetToSlateOffsets(parent, 0, {
        yParentDelta,
      });
      expect(pathOffset).toEqual(1);
    });

    it('returns the inline element with assoc < 0', () => {
      const [pathOffset] = yOffsetToSlateOffsets(parent, 1, {
        yParentDelta,
        assoc: -1,
      });
      expect(pathOffset).toEqual(1);
    });
  });
});
