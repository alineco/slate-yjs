import { it, describe, expect } from 'vitest';
import { runCollaborationTests } from './support/runCollaborationTests';

const skip =
  process.env.YJS_VERSIONS && !process.env.YJS_VERSIONS.includes('latest');

describe.skipIf(skip)('latest yjs', async () => {
  it('uses the correct verison of yjs', async () => {
    expect(await import('yjs')).not.toMatchObject({
      version: 'oldest',
    });
  });

  runCollaborationTests();
});
