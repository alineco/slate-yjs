# @slate-yjs/core

## 1.3.2

### Patch Changes

- [`18ddfa5`](https://github.com/BitPhinix/slate-yjs/commit/18ddfa5c9b51d12e2b168441d83c51beef7f6f53) Thanks [@12joan](https://github.com/12joan)! - Improve error messages for frequently occurring errors

## 1.3.1

### Patch Changes

- [`285b53e`](https://github.com/BitPhinix/slate-yjs/commit/285b53ed9ffc7bf054a257fa9a18cf230fada32c) Thanks [@12joan](https://github.com/12joan)! - Fix incorrect insertion location when inserting an inline element before a newly inserted empty text node

## 1.3.0

### Minor Changes

- [`8dd85dc`](https://github.com/BitPhinix/slate-yjs/commit/8dd85dc427b27077eeb630f98bfd12aacec76e9f) Thanks [@12joan](https://github.com/12joan)! - Export the `inspectYText` utility function (previously used only in testing code)

## 1.2.3

### Patch Changes

- [`16f88cb`](https://github.com/BitPhinix/slate-yjs/commit/16f88cb5bc6629ea44f91ddda2dd7a8614512733) Thanks [@12joan](https://github.com/12joan)! - Ensure that if remote changes result in local Slate normalizations, these normalizations are correctly applied to Yjs.

## 1.2.2

### Patch Changes

- [`adbc1b8`](https://github.com/BitPhinix/slate-yjs/commit/adbc1b8342ba965f173fdf836620b517eaa9ec9a) Thanks [@12joan](https://github.com/12joan)! - Fix a bug that occurs on Chromium and WebKit due to the implementation of those browsers' `Array.prototype.sort` functions differing from those of Firefox and Node. This resulted in inconsistent behaviour when sorting Yjs deltas using a compare function that did not obey the transitive property, causing deltas to be applied incorrectly in some cases.

## 1.2.1

### Patch Changes

- [`8017e55`](https://github.com/BitPhinix/slate-yjs/commit/8017e5539bb6cd85387e0e30bb35fca0f11491f7) Thanks [@12joan](https://github.com/12joan)! - Correctly handle `insert_text` and `remove_text` operations that insert or remove no text.

## 1.2.0

### Minor Changes

- [`5005b25`](https://github.com/BitPhinix/slate-yjs/commit/5005b25f7dab1a678df9e3f86bf155330955b881) Thanks [@12joan](https://github.com/12joan)! - Support storing properties on empty text nodes through the use of invisible empty text characters (zero-width spaces with a special attribute) in the Yjs document

## 1.0.2

### Patch Changes

- [#411](https://github.com/BitPhinix/slate-yjs/pull/411) [`117c9e5`](https://github.com/BitPhinix/slate-yjs/commit/117c9e504d826ea3ea4e69437f671ada8a44855f) Thanks [@BrentFarese](https://github.com/BrentFarese)! - Patch bug in mergeNode that causes getYTarget to error.

## 1.0.1

### Patch Changes

- [#402](https://github.com/BitPhinix/slate-yjs/pull/402) [`c453baf`](https://github.com/BitPhinix/slate-yjs/commit/c453baf5c7a720436ee434eda3e93fe16e1482fc) Thanks [@juliankrispel](https://github.com/juliankrispel)! - Fix applyDelta to produce correct slate operations for adjacent text operations

## 1.0.0

### Minor Changes

- [#395](https://github.com/BitPhinix/slate-yjs/pull/395) [`a6a27c8`](https://github.com/BitPhinix/slate-yjs/commit/a6a27c86678656e55ecbf0ba76852545605a0955) Thanks [@BitPhinix](https://github.com/BitPhinix)! - ignore formatting attributes for non-text

- [#398](https://github.com/BitPhinix/slate-yjs/pull/398) [`72bbbf3`](https://github.com/BitPhinix/slate-yjs/commit/72bbbf3bb8a3f57762153cbd9a7f689d2b282f0c) Thanks [@gblaketx](https://github.com/gblaketx)! - Fix assoc calculation when creating relative position from a Slate point

### Patch Changes

- [#395](https://github.com/BitPhinix/slate-yjs/pull/395) [`a6a27c8`](https://github.com/BitPhinix/slate-yjs/commit/a6a27c86678656e55ecbf0ba76852545605a0955) Thanks [@BitPhinix](https://github.com/BitPhinix)! - chore: remove unnecessary assertion

## 0.3.1

### Patch Changes

- [#369](https://github.com/BitPhinix/slate-yjs/pull/369) [`aa10864`](https://github.com/BitPhinix/slate-yjs/commit/aa108641f44ca00559124cca8277a7c1e4354c00) Thanks [@BitPhinix](https://github.com/BitPhinix)! - Normalize editor on connect to avoid rendering denormalized state

## 0.3.0

### Patch Changes

- [#363](https://github.com/BitPhinix/slate-yjs/pull/363) [`3710c48`](https://github.com/BitPhinix/slate-yjs/commit/3710c4887ee89946ace787ba24436d82d95bc856) Thanks [@BitPhinix](https://github.com/BitPhinix)! - Loosen `CursorEditor.isCursorEditor` to not check awareness instance.

## 0.2.8

### Patch Changes

- [#360](https://github.com/BitPhinix/slate-yjs/pull/360) [`c3c7a44`](https://github.com/BitPhinix/slate-yjs/commit/c3c7a4428fd500a94796747537b87512d9ed3ca6) Thanks [@zarv1k](https://github.com/zarv1k)! - fix: use editor properties in plugin methods

## 0.2.7

### Patch Changes

- [#358](https://github.com/BitPhinix/slate-yjs/pull/358) [`27d39dd`](https://github.com/BitPhinix/slate-yjs/commit/27d39ddc3cf79797a878d0540f8b2605fcf38988) Thanks [@zarv1k](https://github.com/zarv1k)! - use editor.sharedRoot in connect/disconnect

## 0.2.6

### Patch Changes

- [#352](https://github.com/BitPhinix/slate-yjs/pull/352) [`3e172a6`](https://github.com/BitPhinix/slate-yjs/commit/3e172a63f6d0a298da26975cb2b6831a02f81f2b) Thanks [@BitPhinix](https://github.com/BitPhinix)! - Throw error in non-static connect call if editor is already connected

## 0.2.5

### Patch Changes

- [#350](https://github.com/BitPhinix/slate-yjs/pull/350) [`bc90d51`](https://github.com/BitPhinix/slate-yjs/commit/bc90d51b191ae2e13aac40ff986d2fe3c626eac3) Thanks [@AntonNiklasson](https://github.com/AntonNiklasson)! - Decode positions as binary in getStoredPositionsInDeltaAbsolute

## 0.2.3

### Patch Changes

- [#334](https://github.com/BitPhinix/slate-yjs/pull/334) [`5172e4a`](https://github.com/BitPhinix/slate-yjs/commit/5172e4a0033db41bc3530f227c5371e9ddb22269) Thanks [@BitPhinix](https://github.com/BitPhinix)! - don't autoConnect by default
