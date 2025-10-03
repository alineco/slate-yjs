import { describe, vi } from 'vitest';
import * as YOldest from 'yjsOldestSupported';

/**
 * Various internal code tries to read these exports from the 'yjs' package,
 * even though they don't exist. Provide them anyway so that Vitest doesn't
 * complain.
 */
const extraExports = {
  $$typeof: undefined,
  nodeType: undefined,
  tagName: undefined,
  '@@__IMMUTABLE_ITERABLE__@@': undefined,
  '@@__IMMUTABLE_RECORD__@@': undefined,
};

vi.mock('yjs', () => ({
  version: 'oldest',
  ...extraExports,
  ...YOldest,
}));

const { runCollaborationTests } = await import(
  './support/runCollaborationTests'
);

describe('oldest supported yjs', async () => {
  runCollaborationTests({ expectOldest: true });
});
