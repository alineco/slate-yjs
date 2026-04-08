/** @jsx jsx */
import { describe, it, expect } from 'vitest';
import { Descendant, Editor } from 'slate';
import { jsx } from '../support/jsx';
import { yTextFactory } from '../support/utils';
import { yTextToInsertDelta } from '../../src/utils/delta';
import { getInsertMethod } from '../../src/applyToSlate/getInsertMethod';

describe('getInsertMethod', () => {
  const beforeLegacyEmptyTextNodes: Descendant[] = (
    <fragment>
      {/* 0 */}
      <text>one</text>
      {/* 3 */}
      <text>two</text>
      {/* 6 */}
      <text bold>three</text>
      {/* 11 */}
      <text />
      {/* 12 */}
      <text italic />
      {/* 13 */}
      <text italic>four</text>
      {/* 17 */}
      <link />
      {/* 18 */}
    </fragment>
  );

  const editor: Editor = (
    <editor>
      <unstyled>
        {beforeLegacyEmptyTextNodes}
        {/* 18 */}
        <text />
        <text />
        <text bold />
        <text bold />
        {/* 18 */}
        <link />
        {/* 19 */}
        <text italic />
      </unstyled>
    </editor>
  );

  const yParentDelta = yTextToInsertDelta(
    yTextFactory(beforeLegacyEmptyTextNodes)
  );

  it('inserts into matching non-empty text node before offset', () => {
    const result = getInsertMethod(editor, [0], yParentDelta, 3, {});
    expect(result).toEqual({
      method: 'insertText',
      at: { path: [0, 0], offset: 3 },
    });
  });

  it('inserts into matching non-empty text node after offset', () => {
    const result = getInsertMethod(editor, [0], yParentDelta, 6, {
      bold: true,
    });
    expect(result).toEqual({
      method: 'insertText',
      at: { path: [0, 2], offset: 0 },
    });
  });

  it('inserts as node at offset', () => {
    const result = getInsertMethod(editor, [0], yParentDelta, 6, {
      italic: true,
    });
    expect(result).toEqual({
      method: 'insertNode',
      at: [0, 2],
    });
  });

  it('does not insert into matching empty text node after offset', () => {
    const result = getInsertMethod(editor, [0], yParentDelta, 11, {});
    expect(result).toEqual({
      method: 'insertNode',
      at: [0, 3],
    });
  });

  it('does not insert into matching empty text node before offset', () => {
    const result = getInsertMethod(editor, [0], yParentDelta, 13, {
      italic: true,
    });
    expect(result).toEqual({
      method: 'insertText',
      at: { path: [0, 5], offset: 0 },
    });
  });

  it('inserts into first matching legacy empty text node at offset', () => {
    const result = getInsertMethod(editor, [0], yParentDelta, 18, {
      bold: true,
    });
    expect(result).toEqual({
      method: 'insertText',
      at: { path: [0, 9], offset: 0 },
    });
  });

  it('does not insert into non-matching legacy text node separated by non-empty text node', () => {
    const result = getInsertMethod(editor, [0], yParentDelta, 18, {
      italic: true,
    });
    expect(result).toEqual({
      method: 'insertNode',
      at: [0, 11],
    });
  });

  it('inserts after the last child', () => {
    const result = getInsertMethod(editor, [0], yParentDelta, 19, {
      bold: true,
    });
    expect(result).toEqual({
      method: 'insertNode',
      at: [0, 13],
    });
  });
});
