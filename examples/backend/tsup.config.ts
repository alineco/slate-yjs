/* eslint-disable import/no-default-export */
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm'],
    platform: 'node',
    splitting: false,
    bundle: true,
    sourcemap: false,
    dts: false,
    clean: true,
  },
]);
