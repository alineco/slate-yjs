/** @jsx jsx */
import { describe, it, expect } from 'vitest';
import { Editor, Node } from 'slate';
import { jsx } from '../support/jsx';
import { yTextFactory } from '../support/utils';
import { yTextToInsertDelta } from '../../src/utils/delta';
import { getInsertMethod } from '../../src/applyToSlate/getInsertMethod';

describe('getInsertMethod', () => {
  describe('inserting text', () => {
    describe('inserting as text into matching non-empty text nodes or legacy empty text nodes', () => {
      it('inserts into matching non-empty text node surrounding the offset', () => {
        const editor: Editor = (
          <editor>
            <unstyled>
              <text>one</text>
              <text bold>two</text>
              <text>three</text>
            </unstyled>
          </editor>
        );

        const yParentDelta = yTextToInsertDelta(
          yTextFactory(Node.ancestor(editor, [0]))
        );

        const result = getInsertMethod({
          editor,
          parentPath: [0],
          yParentDelta,
          yOffset: 'onetw'.length,
          maximumPath: null,
          change: {
            insert: 'x',
            attributes: { bold: true },
          },
        });

        expect(result).toEqual({
          method: 'insertText',
          at: { path: [0, 1], offset: 2 },
        });
      });

      it('inserts into matching non-empty text node before the offset', () => {
        const editor: Editor = (
          <editor>
            <unstyled>
              <text>one</text>
              <text>two</text>
            </unstyled>
          </editor>
        );

        const yParentDelta = yTextToInsertDelta(
          yTextFactory(Node.ancestor(editor, [0]))
        );

        const result = getInsertMethod({
          editor,
          parentPath: [0],
          yParentDelta,
          yOffset: 'one'.length,
          maximumPath: null,
          change: {
            insert: 'x',
          },
        });

        expect(result).toEqual({
          method: 'insertText',
          at: { path: [0, 0], offset: 3 },
        });
      });

      it('inserts into matching non-empty text node after the offset', () => {
        const editor: Editor = (
          <editor>
            <unstyled>
              <text>one</text>
              <text bold>two</text>
            </unstyled>
          </editor>
        );

        const yParentDelta = yTextToInsertDelta(
          yTextFactory(Node.ancestor(editor, [0]))
        );

        const result = getInsertMethod({
          editor,
          parentPath: [0],
          yParentDelta,
          yOffset: 'one'.length,
          maximumPath: null,
          change: {
            insert: 'x',
            attributes: { bold: true },
          },
        });

        expect(result).toEqual({
          method: 'insertText',
          at: { path: [0, 1], offset: 0 },
        });
      });

      it('inserts into the first matching legacy empty text node at the offset', () => {
        const editor: Editor = (
          <editor>
            <unstyled>
              <text>one</text>
              <text bold />
              <text italic />
              <text underline />
              <text bold />
              <text italic />
              <text underline />
              <text>two</text>
            </unstyled>
          </editor>
        );

        const yParentDelta = yTextToInsertDelta(
          yTextFactory(
            <fragment>
              <text>one</text>
              {/* No empty text nodes since they're legacy */}
              <text>two</text>
            </fragment>
          )
        );

        const result = getInsertMethod({
          editor,
          parentPath: [0],
          yParentDelta,
          yOffset: 'one'.length,
          maximumPath: null,
          change: {
            insert: 'x',
            attributes: { underline: true },
          },
        });

        expect(result).toEqual({
          method: 'insertText',
          at: { path: [0, 3], offset: 0 },
        });
      });
    });

    describe('inserting as node when no non-empty text nodes or legacy empty text nodes match', () => {
      it('splits a non-matching non-empty text node surrounding the offset', () => {
        const editor: Editor = (
          <editor>
            <unstyled>
              <text>one</text>
              <text bold>two</text>
              <text>three</text>
            </unstyled>
          </editor>
        );

        const yParentDelta = yTextToInsertDelta(
          yTextFactory(Node.ancestor(editor, [0]))
        );

        const result = getInsertMethod({
          editor,
          parentPath: [0],
          yParentDelta,
          yOffset: 'onetw'.length,
          maximumPath: null,
          change: {
            insert: 'x',
          },
        });

        expect(result).toEqual({
          method: 'insertNode',
          at: { path: [0, 1], offset: 2 },
        });
      });

      it('inserts as node at the offset when no text nodes match', () => {
        const editor: Editor = (
          <editor>
            <unstyled>
              <text>one</text>
              <text bold>two</text>
            </unstyled>
          </editor>
        );

        const yParentDelta = yTextToInsertDelta(
          yTextFactory(Node.ancestor(editor, [0]))
        );

        const result = getInsertMethod({
          editor,
          parentPath: [0],
          yParentDelta,
          yOffset: 'one'.length,
          maximumPath: null,
          change: {
            insert: 'x',
            attributes: { italic: true },
          },
        });

        expect(result).toEqual({ method: 'insertNode', at: [0, 1] });
      });

      it('does not insert into an empty text node before the offset even if it matches', () => {
        const editor: Editor = (
          <editor>
            <unstyled>
              <text bold />
              <text>two</text>
            </unstyled>
          </editor>
        );

        const yParentDelta = yTextToInsertDelta(
          yTextFactory(Node.ancestor(editor, [0]))
        );

        const result = getInsertMethod({
          editor,
          parentPath: [0],
          yParentDelta,
          yOffset: 1,
          maximumPath: null,
          change: {
            insert: 'x',
            attributes: { bold: true },
          },
        });

        expect(result).toEqual({ method: 'insertNode', at: [0, 1] });
      });

      it('does not insert into an empty text node after the offset even if it matches', () => {
        const editor: Editor = (
          <editor>
            <unstyled>
              <text bold>one</text>
              <text />
            </unstyled>
          </editor>
        );

        const yParentDelta = yTextToInsertDelta(
          yTextFactory(Node.ancestor(editor, [0]))
        );

        const result = getInsertMethod({
          editor,
          parentPath: [0],
          yParentDelta,
          yOffset: 'one'.length,
          maximumPath: null,
          change: {
            insert: 'x',
          },
        });

        expect(result).toEqual({ method: 'insertNode', at: [0, 1] });
      });

      it('inserts as node after the last legacy empty text node if none of the matches', () => {
        const editor: Editor = (
          <editor>
            <unstyled>
              <text>one</text>
              <text bold />
              <text italic />
              <text underline />
              <text bold />
              <text italic />
              <text underline />
              <text>two</text>
            </unstyled>
          </editor>
        );

        const yParentDelta = yTextToInsertDelta(
          yTextFactory(
            <fragment>
              <text>one</text>
              {/* No empty text nodes since they're legacy */}
              <text>two</text>
            </fragment>
          )
        );

        const result = getInsertMethod({
          editor,
          parentPath: [0],
          yParentDelta,
          maximumPath: null,
          yOffset: 'one'.length,
          change: {
            insert: 'x',
            attributes: { bold: true, italic: true },
          },
        });

        expect(result).toEqual({ method: 'insertNode', at: [0, 7] });
      });

      it('inserts as node after the last node if the last node does not match', () => {
        const editor: Editor = (
          <editor>
            <unstyled>
              <text bold>one</text>
              <text>two</text>
            </unstyled>
          </editor>
        );

        const yParentDelta = yTextToInsertDelta(
          yTextFactory(Node.ancestor(editor, [0]))
        );

        const result = getInsertMethod({
          editor,
          parentPath: [0],
          yParentDelta,
          yOffset: 'onetwo'.length,
          maximumPath: null,
          change: {
            insert: 'x',
            attributes: { bold: true },
          },
        });

        expect(result).toEqual({ method: 'insertNode', at: [0, 2] });
      });
    });
  });

  describe('inserting an inline element', () => {
    it('splits a non-empty text node surrounding the offset', () => {
      const editor: Editor = (
        <editor>
          <unstyled>
            <text>one</text>
            <text bold>two</text>
            <text>three</text>
          </unstyled>
        </editor>
      );

      const yParentDelta = yTextToInsertDelta(
        yTextFactory(Node.ancestor(editor, [0]))
      );

      const result = getInsertMethod({
        editor,
        parentPath: [0],
        yParentDelta,
        yOffset: 'onetw'.length,
        maximumPath: null,
        change: {
          insert: yTextFactory(<link>click me</link>),
        },
      });

      expect(result).toEqual({
        method: 'insertNode',
        at: { path: [0, 1], offset: 2 },
      });
    });

    it('inserts between two non-empty text nodes', () => {
      const editor: Editor = (
        <editor>
          <unstyled>
            <text>one</text>
            <text>two</text>
          </unstyled>
        </editor>
      );

      const yParentDelta = yTextToInsertDelta(
        yTextFactory(Node.ancestor(editor, [0]))
      );

      const result = getInsertMethod({
        editor,
        parentPath: [0],
        yParentDelta,
        yOffset: 'one'.length,
        maximumPath: null,
        change: {
          insert: yTextFactory(<link>click me</link>),
        },
      });

      expect(result).toEqual({ method: 'insertNode', at: [0, 1] });
    });

    it('inserts between a non-empty and an empty text node', () => {
      const editor: Editor = (
        <editor>
          <unstyled>
            <text>one</text>
            <text />
          </unstyled>
        </editor>
      );

      const yParentDelta = yTextToInsertDelta(
        yTextFactory(Node.ancestor(editor, [0]))
      );

      const result = getInsertMethod({
        editor,
        parentPath: [0],
        yParentDelta,
        yOffset: 'one'.length,
        maximumPath: null,
        change: {
          insert: yTextFactory(<link>click me</link>),
        },
      });

      expect(result).toEqual({ method: 'insertNode', at: [0, 1] });
    });

    it('inserts between an empty and a non-empty text node', () => {
      const editor: Editor = (
        <editor>
          <unstyled>
            <text />
            <text>two</text>
          </unstyled>
        </editor>
      );

      const yParentDelta = yTextToInsertDelta(
        yTextFactory(Node.ancestor(editor, [0]))
      );

      const result = getInsertMethod({
        editor,
        parentPath: [0],
        yParentDelta,
        yOffset: 1,
        maximumPath: null,
        change: {
          insert: yTextFactory(<link>click me</link>),
        },
      });

      expect(result).toEqual({ method: 'insertNode', at: [0, 1] });
    });

    it('inserts between two empty text nodes', () => {
      const editor: Editor = (
        <editor>
          <unstyled>
            <text />
            <text />
          </unstyled>
        </editor>
      );

      const yParentDelta = yTextToInsertDelta(
        yTextFactory(Node.ancestor(editor, [0]))
      );

      const result = getInsertMethod({
        editor,
        parentPath: [0],
        yParentDelta,
        yOffset: 1,
        maximumPath: null,
        change: {
          insert: yTextFactory(<link>click me</link>),
        },
      });

      expect(result).toEqual({ method: 'insertNode', at: [0, 1] });
    });

    it('inserts after the last legacy empty text node', () => {
      const editor: Editor = (
        <editor>
          <unstyled>
            <text>one</text>
            <text bold />
            <text italic />
            <text underline />
            <text bold />
            <text italic />
            <text underline />
            <text>two</text>
          </unstyled>
        </editor>
      );

      const yParentDelta = yTextToInsertDelta(
        yTextFactory(
          <fragment>
            <text>one</text>
            {/* No empty text nodes since they're legacy */}
            <text>two</text>
          </fragment>
        )
      );

      const result = getInsertMethod({
        editor,
        parentPath: [0],
        yParentDelta,
        yOffset: 'one'.length,
        maximumPath: null,
        change: {
          insert: yTextFactory(<link>click me</link>),
        },
      });

      expect(result).toEqual({ method: 'insertNode', at: [0, 7] });
    });

    it('does not insert past maximumPath', () => {
      const editor: Editor = (
        <editor>
          <unstyled>
            <text>one</text>
            <text bold />
            <text italic />
            <text underline />
            <text bold />
            <text italic />
            <text underline />
            <text>two</text>
          </unstyled>
        </editor>
      );

      const yParentDelta = yTextToInsertDelta(
        yTextFactory(
          <fragment>
            <text>one</text>
            {/* No empty text nodes since they're legacy */}
            <text>two</text>
          </fragment>
        )
      );

      const result = getInsertMethod({
        editor,
        parentPath: [0],
        yParentDelta,
        yOffset: 'one'.length,
        maximumPath: [0, 3],
        change: {
          insert: yTextFactory(<link>click me</link>),
        },
      });

      expect(result).toEqual({ method: 'insertNode', at: [0, 3] });
    });
  });
});
