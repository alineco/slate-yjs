import { describe } from 'vitest';
import { runCollaborationTests } from './support/runCollaborationTests';

const skip =
  process.env.YJS_VERSIONS && !process.env.YJS_VERSIONS.includes('latest');

describe.skipIf(skip)('latest yjs', async () => {
  runCollaborationTests();
});
