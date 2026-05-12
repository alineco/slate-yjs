import { createEditor, Editor, Point } from 'slate';
import { expect, it } from 'vitest';
import * as Y from 'yjs';
import { FixtureModule, fixtures } from './fixtures';
import { yTextToSlateElement } from '../../src';
import { withTestingElements } from './withTestingElements';
import { inspectYText, yTextFactory } from './utils';
import {
  getStoredPosition,
  relativePositionToSlatePoint,
  setStoredPosition,
  slatePointToRelativePosition,
} from '../../src/utils/position';
import { assertDocumentAttachment } from '../../src/utils/yjs';

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
    initialRemoteSelection,
    run,
    expected,
    yExpected = yTextFactory(expected),
    expectedStoredPositions = {},
    expectedRemoteSelection,
  } = module;

  // Snapshot `input.children` before `withTestingElements` mutates the
  // editor object — used to rebuild a normalized reference for the
  // pre-run parity check below.
  const inputChildrenSnapshot = structuredClone(input.children);

  // Setup 'local' editor
  const editor = await withTestingElements(input, { sharedType: yInput });
  assertDocumentAttachment(editor.sharedRoot);

  // Keep the 'local' editor state before applying run.
  const baseState = Y.encodeStateAsUpdateV2(editor.sharedRoot.doc);

  // Setup 'streamed' editor: a remote peer that receives every Yjs
  // update from the local doc as it happens, simulating a live
  // connection rather than the one-shot replay further down.
  const streamedDoc = new Y.Doc();
  Y.applyUpdateV2(streamedDoc, baseState);
  const streamed = await withTestingElements(createEditor(), {
    doc: streamedDoc,
  });
  editor.sharedRoot.doc.on('updateV2', (update: Uint8Array) => {
    Y.applyUpdateV2(streamedDoc, update);
  });

  Editor.normalize(editor, { force: true });

  if (!yInput) {
    // The normalized editor state should match the shared root.
    expect(await normalizedSlateDoc(editor.sharedRoot)).toEqual(
      editor.children
    );
  }

  // Before `run`, both editors must hold the input state. When `yInput`
  // is provided the legacy yjs state overrides `input`, so we can only
  // assert that streamed mirrors local. Local first: if it fails, the
  // fixture is malformed, not the sync.
  if (!yInput) {
    const inputClone = createEditor();
    inputClone.children = inputChildrenSnapshot;
    const inputEditor = await withTestingElements(inputClone);
    expect(editor.children).toEqual(inputEditor.children);
  }
  expect(streamed.children).toEqual(editor.children);

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

  // Verify editor is in expected state. Local first, then streamed —
  // so a fixture bug surfaces before a sync bug.
  const expectedEditor = await withTestingElements(expected);
  expect(editor.children).toEqual(expectedEditor.children);
  expect(streamed.children).toEqual(expectedEditor.children);
  if (expectedEditor.selection) {
    expect(editor.selection).toEqual(expectedEditor.selection);
  }
  expect(inspectYText(editor.sharedRoot)).toEqual(inspectYText(yExpected));

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
  if (initialRemoteSelection) {
    remote.selection = Point.isPoint(initialRemoteSelection)
      ? { anchor: initialRemoteSelection, focus: initialRemoteSelection }
      : initialRemoteSelection;
  }
  remote.onChange();

  // Apply changes from 'run'
  Y.applyUpdateV2(remoteDoc, Y.encodeStateAsUpdateV2(editor.sharedRoot.doc));

  // Verify remote and editor state are equal
  expect(editor.children).toEqual(remote.children);
  expect(inspectYText(remote.sharedRoot)).toEqual(inspectYText(yExpected));

  // Verify that prevSharedRoot and sharedRoot are equal
  expect(editor.prevSharedRoot && inspectYText(editor.prevSharedRoot)).toEqual(
    inspectYText(editor.sharedRoot)
  );

  expect(remote.prevSharedRoot && inspectYText(remote.prevSharedRoot)).toEqual(
    inspectYText(remote.sharedRoot)
  );

  if (initialRemoteSelection) {
    expect(remote.selection).toEqual(
      Point.isPoint(expectedRemoteSelection)
        ? { anchor: expectedRemoteSelection, focus: expectedRemoteSelection }
        : expectedRemoteSelection ?? null
    );
  }
}

export function runCollaborationTests({
  expectOldest = false,
}: { expectOldest?: boolean } = {}) {
  it('uses the correct version of Yjs', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((Y as any).version).toBe(expectOldest ? 'oldest' : undefined);
  });

  fixtures(__dirname, '../collaboration', runCollaborationTest);
}
