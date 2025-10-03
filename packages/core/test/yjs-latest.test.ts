import { it, describe, expect } from 'vitest';
import { runCollaborationTests } from './support/runCollaborationTests';

describe('latest yjs', () => {
  it('uses the correct verison of yjs', async () => {
    expect(await import('yjs')).not.toMatchObject({
      version: 'oldest',
    });
  });

  runCollaborationTests();
});
