/* eslint-disable import/no-extraneous-dependencies */
import { createEditor, Editor, Operation } from 'slate';
import { describe, expect } from 'vitest';
import * as Y from 'yjs';
import { fixtures } from '../../../support/fixtures';
import { yTextToSlateElement } from '../src';
import { withTestingElements } from './withTestingElements';
import { inspectYText } from './inspectYText';

export type FixtureModule = {
  module: {
    input: Editor;
    yInput?: Y.XmlText;
    expected: Editor;
    yExpected?: Y.XmlText;
    run: (e: Editor) => any;
    skip?: string | (() => string | null);
  };
};

async function normalizedSlateDoc(sharedRoot: Y.XmlText) {
  const editor = createEditor();
  editor.children = yTextToSlateElement(sharedRoot).children;
  const e = await withTestingElements(editor);
  Editor.normalize(e, { force: true });
  return e.children;
}

function trackNormalizeOps(editor: Editor) {
  const ops: Operation[] = [];

  const { apply, normalize } = editor;

  let inNormalize = false;

  editor.normalize = (options) => {
    const prevInNormalize = inNormalize;
    inNormalize = true;
    try {
      normalize(options);
    } finally {
      inNormalize = prevInNormalize;
    }
  };

  editor.apply = (op) => {
    if (inNormalize) {
      ops.push(op);
    }
    apply(op);
  };

  return { current: ops };
}

async function runCollaborationTest({ module }: FixtureModule) {
  // Setup 'local' editor
  const { input, yInput, run, expected, yExpected } = module;
  const editor = await withTestingElements(input, { sharedType: yInput });

  // Keep the 'local' editor state before applying run.
  const baseState = Y.encodeStateAsUpdateV2(editor.sharedRoot.doc);

  Editor.normalize(editor, { force: true });

  if (!yInput) {
    // The normalized editor state should match the shared root.
    expect(await normalizedSlateDoc(editor.sharedRoot)).toEqual(
      editor.children
    );
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

  // Setup remote editor with input base state
  const remoteDoc = new Y.Doc();
  Y.applyUpdateV2(remoteDoc, baseState);
  const remote = await withTestingElements(createEditor(), { doc: remoteDoc });
  // const remoteNormalizeOps = trackNormalizeOps(remote);

  // Apply changes from 'run'
  Y.applyUpdateV2(remoteDoc, Y.encodeStateAsUpdateV2(editor.sharedRoot.doc));

  // // Verify that the remote editor did not require normalizing
  // expect(remoteNormalizeOps.current).toEqual([]);

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

async function runUnitTest({ module }: FixtureModule) {
  const { input, run, expected } = module;
  const editor = await withTestingElements(input);
  const runOutput = run(editor);
  expect(runOutput).toEqual(expected);
}

describe('adapter', () => {
  fixtures(__dirname, 'unit', runUnitTest);
  fixtures(__dirname, 'collaboration', runCollaborationTest);
});
