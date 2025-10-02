/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable import/no-extraneous-dependencies */
import { Editor, Point } from 'slate';
import * as Y from 'yjs';
import * as fs from 'fs';
import { basename, extname, resolve } from 'path';
import { describe, it } from 'vitest';
import chalk from 'chalk';

export interface FixtureModule {
  input: Editor;
  yInput?: Y.XmlText;
  inputStoredPositions?: Record<string, Point>;
  expected: Editor;
  yExpected?: Y.XmlText;
  expectedStoredPositions?: Record<string, Point | null>;
  run: (e: Editor) => void;
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
