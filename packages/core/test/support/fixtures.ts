import { Editor, Point, Range } from 'slate';
import * as Y from 'yjs';
import * as fs from 'fs';
import { basename, extname, resolve } from 'path';
import { describe, it } from 'vitest';
import chalk from 'chalk';

export interface FixtureModule {
  /**
   * The transformation to perform on the local Slate editor for the purpose of
   * the test.
   */
  run: (e: Editor) => void;

  /**
   * The initial Slate state of the local and remote editors.
   */
  input: Editor;

  /**
   * The expected final Slate state of the local and remote editors.
   */
  expected: Editor;

  /**
   * Optionally override the initial Yjs state. By default, this is derived from
   * the initial Slate state.
   */
  yInput?: Y.XmlText;

  /**
   * Optionally override the expected final Yjs state.
   */
  yExpected?: Y.XmlText;

  /**
   * The set of stored positions to maintain during the test. The value of each
   * position can be asserted on using expectedStoredPositions.
   */
  inputStoredPositions?: Record<string, Point>;
  expectedStoredPositions?: Record<string, Point | null>;

  /**
   * Optionally override the initial Slate selection of the remote editor. By
   * default, the initial selection of the remote editor is null. The final
   * remote selection can be asserted on using expectedRemoteSelection.
   */
  initialRemoteSelection?: Range | Point;
  expectedRemoteSelection?: Range | Point;

  /**
   * Whether the test should also apply changes from the remote editor to the
   * local editor, typically in the case where normalizations must be applied on
   * the remote editor due to a Slate mismatch.
   *
   * This defaults to false since in most cases, a unidirectional sync should be
   * sufficient to synchronize the local and remote editors. Generally, this
   * should only be enabled when a Slate mismatch is expected, such as in some
   * tests relating to legacy empty text nodes.
   */
  bidirectionalSync?: boolean;

  /**
   * Optionally skip a test. If a string is passed, the test will be skipped
   * unconditionally and the given message will be displayed. If a function is
   * passed, the test will only be skipped if that function returns a string
   * message.
   */
  skip?: string | (() => string | null);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fixtures<P extends any[]>(...args: P) {
  let fn = args.pop();
  let options = { skip: false };

  if (typeof fn !== 'function') {
    options = fn;
    fn = args.pop();
  }

  const path = resolve(...args);
  const files = fs.readdirSync(path);
  const dir = basename(path);
  const d = options.skip ? describe.skip : describe;

  d(dir, () => {
    for (const file of files) {
      const p = resolve(path, file);
      const stat = fs.statSync(p);

      if (stat.isDirectory()) {
        fixtures(path, file, fn);
      }
      if (
        stat.isFile() &&
        (file.endsWith('.js') ||
          file.endsWith('.tsx') ||
          file.endsWith('.ts')) &&
        !file.endsWith('custom-types.ts') &&
        !file.endsWith('type-guards.ts') &&
        !file.startsWith('.') &&
        // Ignoring `index.js` files allows us to use the fixtures directly
        // from the top-level directory itself, instead of only children.
        file !== 'index.js'
      ) {
        const name = basename(file, extname(file));
        const testIt = p.toLowerCase().includes('only') ? it.only : it;

        testIt(`${name} `, async () => {
          const module: FixtureModule = await import(p);
          const { skip } = module;
          const skipReason = typeof skip === 'function' ? skip() : skip;

          if (skipReason) {
            // eslint-disable-next-line no-console
            console.warn(
              chalk.yellow(`Skipped ${dir} > ${name}: ${skipReason}`)
            );
            return;
          }

          await fn({ name, path, module });
        });
      }
    }
  });
}

fixtures.skip = <P extends unknown[]>(...args: P) => {
  fixtures(...args, { skip: true });
};
