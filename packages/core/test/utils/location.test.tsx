/** @jsx jsx */
import { describe, it, expect } from 'vitest';
import { Ancestor, Descendant } from 'slate';
import { jsx } from '../../../../support/jsx';
import { yTextFactory } from '../yTextFactory';
import { yOffsetToSlateLocation } from '../../src/utils/location';

describe('yOffsetToSlateLocation', () => {
  describe('with block children', () => {
    it('returns the first child', () => {
      const content: Descendant[] = (
        <fragment>
          <unstyled>one</unstyled>
          <unstyled>two</unstyled>
          <unstyled>three</unstyled>
        </fragment>
      );

      const parent: Ancestor = <unstyled>{content}</unstyled>;
      const yParentDelta = yTextFactory(content).toDelta();
      const location = yOffsetToSlateLocation(parent, [2], 0, { yParentDelta });

      expect(location).toEqual([2, 0]);
    });

    it('returns the second child', () => {
      const content: Descendant[] = (
        <fragment>
          <unstyled>one</unstyled>
          <unstyled>two</unstyled>
          <unstyled>three</unstyled>
        </fragment>
      );

      const parent: Ancestor = <unstyled>{content}</unstyled>;
      const yParentDelta = yTextFactory(content).toDelta();
      const location = yOffsetToSlateLocation(parent, [2], 1, { yParentDelta });

      expect(location).toEqual([2, 1]);
    });

    it('returns the last child', () => {
      const content: Descendant[] = (
        <fragment>
          <unstyled>one</unstyled>
          <unstyled>two</unstyled>
          <unstyled>three</unstyled>
        </fragment>
      );

      const parent: Ancestor = <unstyled>{content}</unstyled>;
      const yParentDelta = yTextFactory(content).toDelta();
      const location = yOffsetToSlateLocation(parent, [2], 2, { yParentDelta });

      expect(location).toEqual([2, 2]);
    });

    it('returns the point beyond the last child when in insert mode', () => {
      const content: Descendant[] = (
        <fragment>
          <unstyled>one</unstyled>
          <unstyled>two</unstyled>
          <unstyled>three</unstyled>
        </fragment>
      );

      const parent: Ancestor = <unstyled>{content}</unstyled>;
      const yParentDelta = yTextFactory(content).toDelta();
      const location = yOffsetToSlateLocation(parent, [2], 3, {
        yParentDelta,
        mode: 'insert',
      });

      expect(location).toEqual([2, 3]);
    });
  });

  describe('with inline children', () => {
    it('returns a point in the middle of a text node', () => {
      const content: Descendant[] = (
        <fragment>
          <text bold>one</text>
          <text italic>two</text>
          <text bold>three</text>
        </fragment>
      );

      const parent: Ancestor = <unstyled>{content}</unstyled>;
      const yParentDelta = yTextFactory(content).toDelta();
      const location = yOffsetToSlateLocation(parent, [2], 5, { yParentDelta });

      expect(location).toEqual({
        path: [2, 1],
        offset: 2,
      });
    });

    it('returns a point at the start of the middle text node', () => {
      const content: Descendant[] = (
        <fragment>
          <text bold>one</text>
          <text italic>two</text>
          <text bold>three</text>
        </fragment>
      );

      const parent: Ancestor = <unstyled>{content}</unstyled>;
      const yParentDelta = yTextFactory(content).toDelta();
      const location = yOffsetToSlateLocation(parent, [2], 3, { yParentDelta });

      expect(location).toEqual({
        path: [2, 1],
        offset: 0,
      });
    });

    it('returns a point at the start of the first text node', () => {
      const content: Descendant[] = (
        <fragment>
          <text bold>one</text>
          <text italic>two</text>
          <text bold>three</text>
        </fragment>
      );

      const parent: Ancestor = <unstyled>{content}</unstyled>;
      const yParentDelta = yTextFactory(content).toDelta();
      const location = yOffsetToSlateLocation(parent, [2], 0, { yParentDelta });

      expect(location).toEqual({
        path: [2, 0],
        offset: 0,
      });
    });

    it('returns a point at the end of the last text node', () => {
      const content: Descendant[] = (
        <fragment>
          <text bold>one</text>
          <text italic>two</text>
          <text bold>three</text>
        </fragment>
      );

      const parent: Ancestor = <unstyled>{content}</unstyled>;
      const yParentDelta = yTextFactory(content).toDelta();
      const location = yOffsetToSlateLocation(parent, [2], 11, {
        yParentDelta,
      });

      expect(location).toEqual({
        path: [2, 2],
        offset: 5,
      });
    });

    it('returns a point beyond the last child while in insert mode', () => {
      const content: Descendant[] = (
        <fragment>
          <text bold>one</text>
          <text italic>two</text>
          <text bold>three</text>
        </fragment>
      );

      const parent: Ancestor = <unstyled>{content}</unstyled>;
      const yParentDelta = yTextFactory(content).toDelta();
      const location = yOffsetToSlateLocation(parent, [2], 12, {
        yParentDelta,
        mode: 'insert',
      });

      expect(location).toEqual([2, 3]);
    });

    it('returns an inline element for the offset before that element', () => {
      const content: Descendant[] = (
        <fragment>
          <text bold>one</text>
          <text italic>two</text>
          <link>link</link>
          <text bold>three</text>
        </fragment>
      );

      const parent: Ancestor = <unstyled>{content}</unstyled>;
      const yParentDelta = yTextFactory(content).toDelta();
      const location = yOffsetToSlateLocation(parent, [2], 6, {
        yParentDelta,
        mode: 'insert',
      });

      expect(location).toEqual([2, 2]);
    });
  });
});
