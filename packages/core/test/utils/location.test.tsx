/** @jsx jsx */
import { describe, it, expect } from 'vitest';
import { Ancestor, Descendant } from 'slate';
import { jsx } from '../../../../support/jsx';
import { yTextFactory } from '../yTextFactory';
import {
  slateChildrenInRange,
  yOffsetToSlateLocation,
} from '../../src/utils/location';

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

describe('slateChildrenInRange', () => {
  describe('when end is a path', () => {
    describe('when start is the same path', () => {
      it('returns that path', () => {
        const parent = (
          <unstyled>
            <text>a</text>
            <text bold>b</text>
            <text>c</text>
          </unstyled>
        );

        const result = Array.from(
          slateChildrenInRange(parent, [2], {
            start: [2, 1],
            end: [2, 1],
          })
        );

        expect(result).toEqual([[2, 1]]);
      });
    });

    describe('when start is another path', () => {
      it('returns from start to end in reverse order', () => {
        const parent = (
          <unstyled>
            <text>a</text>
            <text bold>b</text>
            <text>c</text>
            <text bold>d</text>
            <text>e</text>
          </unstyled>
        );

        const result = Array.from(
          slateChildrenInRange(parent, [2], {
            start: [2, 1],
            end: [2, 3],
          })
        );

        expect(result).toEqual([
          [2, 3],
          [2, 2],
          [2, 1],
        ]);
      });
    });

    describe('when start is an earlier point', () => {
      describe('when point is at the start of the start node', () => {
        it('includes the entire start node', () => {
          const parent = (
            <unstyled>
              <text>a</text>
              <text bold>start</text>
              <text>c</text>
              <text bold>d</text>
              <text>e</text>
            </unstyled>
          );

          const result = Array.from(
            slateChildrenInRange(parent, [2], {
              start: { path: [2, 1], offset: 0 },
              end: [2, 3],
            })
          );

          expect(result).toEqual([
            [2, 3],
            [2, 2],
            [2, 1],
          ]);
        });
      });

      describe('when point is in the middle of the start node', () => {
        it('includes only part of the start node', () => {
          const parent = (
            <unstyled>
              <text>a</text>
              <text bold>start</text>
              <text>c</text>
              <text bold>d</text>
              <text>e</text>
            </unstyled>
          );

          const result = Array.from(
            slateChildrenInRange(parent, [2], {
              start: { path: [2, 1], offset: 2 },
              end: [2, 3],
            })
          );

          expect(result).toEqual([
            [2, 3],
            [2, 2],
            {
              anchor: { path: [2, 1], offset: 2 },
              focus: { path: [2, 1], offset: 5 },
            },
          ]);
        });
      });

      describe('when point is at the end of the start node', () => {
        it('skips the start node', () => {
          const parent = (
            <unstyled>
              <text>a</text>
              <text bold>start</text>
              <text>c</text>
              <text bold>d</text>
              <text>e</text>
            </unstyled>
          );

          const result = Array.from(
            slateChildrenInRange(parent, [2], {
              start: { path: [2, 1], offset: 5 },
              end: [2, 3],
            })
          );

          expect(result).toEqual([
            [2, 3],
            [2, 2],
          ]);
        });
      });
    });
  });

  describe('when end is a point', () => {
    describe('when start is a point in the same node', () => {
      describe('when the node is empty', () => {
        it('returns that node', () => {
          const parent = (
            <unstyled>
              <text />
            </unstyled>
          );

          const result = Array.from(
            slateChildrenInRange(parent, [2], {
              start: { path: [2, 0], offset: 0 },
              end: { path: [2, 0], offset: 0 },
            })
          );

          expect(result).toEqual([[2, 0]]);
        });
      });

      describe('when start and end cover the entire node', () => {
        it('returns that node', () => {
          const parent = (
            <unstyled>
              <text>hello</text>
            </unstyled>
          );

          const result = Array.from(
            slateChildrenInRange(parent, [2], {
              start: { path: [2, 0], offset: 0 },
              end: { path: [2, 0], offset: 5 },
            })
          );

          expect(result).toEqual([[2, 0]]);
        });
      });

      describe('when start and end are equal in a non-empty text node', () => {
        it('returns nothing', () => {
          const parent = (
            <unstyled>
              <text>hello</text>
            </unstyled>
          );

          const result = Array.from(
            slateChildrenInRange(parent, [2], {
              start: { path: [2, 0], offset: 1 },
              end: { path: [2, 0], offset: 1 },
            })
          );

          expect(result).toEqual([]);
        });
      });

      describe('when start and end cover part of the node', () => {
        it('returns nothing', () => {
          const parent = (
            <unstyled>
              <text>hello</text>
            </unstyled>
          );

          const result = Array.from(
            slateChildrenInRange(parent, [2], {
              start: { path: [2, 0], offset: 1 },
              end: { path: [2, 0], offset: 4 },
            })
          );

          expect(result).toEqual([
            {
              anchor: { path: [2, 0], offset: 1 },
              focus: { path: [2, 0], offset: 4 },
            },
          ]);
        });
      });
    });

    describe('when start is an earlier path', () => {
      describe('when end is at the start of the node', () => {
        it('skips the end node', () => {
          const parent = (
            <unstyled>
              <text>a</text>
              <text bold>b</text>
              <text>c</text>
              <text bold>end</text>
              <text>e</text>
            </unstyled>
          );

          const result = Array.from(
            slateChildrenInRange(parent, [2], {
              start: [2, 1],
              end: { path: [2, 3], offset: 0 },
            })
          );

          expect(result).toEqual([
            [2, 2],
            [2, 1],
          ]);
        });
      });

      describe('when end is in the middle of the node', () => {
        it('includes part of the end node', () => {
          const parent = (
            <unstyled>
              <text>a</text>
              <text bold>b</text>
              <text>c</text>
              <text bold>end</text>
              <text>e</text>
            </unstyled>
          );

          const result = Array.from(
            slateChildrenInRange(parent, [2], {
              start: [2, 1],
              end: { path: [2, 3], offset: 1 },
            })
          );

          expect(result).toEqual([
            {
              anchor: { path: [2, 3], offset: 0 },
              focus: { path: [2, 3], offset: 1 },
            },
            [2, 2],
            [2, 1],
          ]);
        });
      });

      describe('when end is at the end of the node', () => {
        it('includes the entire end node', () => {
          const parent = (
            <unstyled>
              <text>a</text>
              <text bold>b</text>
              <text>c</text>
              <text bold>end</text>
              <text>e</text>
            </unstyled>
          );

          const result = Array.from(
            slateChildrenInRange(parent, [2], {
              start: [2, 1],
              end: { path: [2, 3], offset: 3 },
            })
          );

          expect(result).toEqual([
            [2, 3],
            [2, 2],
            [2, 1],
          ]);
        });
      });
    });
  });
});
