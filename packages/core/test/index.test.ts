import { createEditor, Editor } from 'slate';
import { describe, expect } from 'vitest';
import * as Y from 'yjs';
import { FixtureModule, fixtures } from './support/fixtures';
import { yTextToSlateElement } from '../src';
import { withTestingElements } from './withTestingElements';
import { inspectYText } from './inspectYText';
import {
  getStoredPosition,
  relativePositionToSlatePoint,
  setStoredPosition,
  slatePointToRelativePosition,
} from '../src/utils/position';
import { assertDocumentAttachment } from '../src/utils/yjs';

async function normalizedSlateDoc(sharedRoot: Y.XmlText) {
  const editor = createEditor();
  editor.children = yTextToSlateElement(sharedRoot).children;
  const e = await withTestingElements(editor);
  Editor.normalize(e, { force: true });
  return e.children;
}

async function runCollaborationTest({ module }: { module: FixtureModule }) {
  const {
    input,
    yInput,
    inputStoredPositions = {},
    run,
    expected,
    yExpected,
    expectedStoredPositions = {},
  } = module;

  // Setup 'local' editor
  const editor = await withTestingElements(input, { sharedType: yInput });
  assertDocumentAttachment(editor.sharedRoot);

  // Keep the 'local' editor state before applying run.
  const baseState = Y.encodeStateAsUpdateV2(editor.sharedRoot.doc);

  Editor.normalize(editor, { force: true });

  if (!yInput) {
    // The normalized editor state should match the shared root.
    expect(await normalizedSlateDoc(editor.sharedRoot)).toEqual(
      editor.children
    );
  }

  for (const [key, point] of Object.entries(inputStoredPositions)) {
    const position = slatePointToRelativePosition(
      editor.sharedRoot,
      editor,
      point
    );
    setStoredPosition(editor.sharedRoot, key, position);
  }

  run(editor);
  editor.onChange();

  if (yExpected) {
    expect(inspectYText(editor.sharedRoot)).toEqual(inspectYText(yExpected));
  } else {
    // Editor state after run should match shared root.
    expect(await normalizedSlateDoc(editor.sharedRoot)).toEqual(
      editor.children
    );
  }

  // Verify that stored positions are updated correctly
  const actualStoredPositions = Object.fromEntries(
    Object.keys(inputStoredPositions).map((key) => {
      const position = getStoredPosition(editor.sharedRoot, key);
      if (!position) return [key, null];

      const point = relativePositionToSlatePoint(
        editor.sharedRoot,
        editor,
        position
      );
      return [key, point];
    })
  );

  expect(actualStoredPositions).toEqual(expectedStoredPositions);

  // Setup remote editor with input base state
  const remoteDoc = new Y.Doc();
  Y.applyUpdateV2(remoteDoc, baseState);
  const remote = await withTestingElements(createEditor(), { doc: remoteDoc });
  // const remoteNormalizeOps = trackNormalizeOps(remote);

  // Apply changes from 'run'
  Y.applyUpdateV2(remoteDoc, Y.encodeStateAsUpdateV2(editor.sharedRoot.doc));

  // Verify editor is in expected state
  const expectedEditor = await withTestingElements(expected);
  Editor.normalize(expectedEditor, { force: true });
  expect(editor.children).toEqual(expectedEditor.children);
  if (expectedEditor.selection) {
    expect(editor.selection).toEqual(expectedEditor.selection);
  }

  // Verify remote and editor state are equal
  if (yExpected) {
    expect(inspectYText(remote.sharedRoot)).toEqual(inspectYText(yExpected));
    expect(editor.children).toEqual(remote.children);
    expect(inspectYText(editor.sharedRoot)).toEqual(inspectYText(yExpected));
  } else {
    expect(await normalizedSlateDoc(editor.sharedRoot)).toEqual(
      editor.children
    );
    expect(await normalizedSlateDoc(remote.sharedRoot)).toEqual(
      remote.children
    );
    expect(inspectYText(remote.sharedRoot)).toEqual(
      inspectYText(editor.sharedRoot)
    );
    expect(remote.children).toEqual(editor.children);
  }
}

async function runUnitTest({ module }: { module: FixtureModule }) {
  const { input, run, expected } = module;
  const editor = await withTestingElements(input);
  const runOutput = run(editor);
  expect(runOutput).toEqual(expected);
}

describe('adapter', () => {
  fixtures(__dirname, 'unit', runUnitTest);
  fixtures(__dirname, 'collaboration', runCollaborationTest);
});
