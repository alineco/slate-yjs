---
'@slate-yjs/core': patch
---

Fix a bug that occurs on Chromium and WebKit due to the implementation of those browsers' `Array.prototype.sort` functions differing from those of Firefox and Node. This resulted in inconsistent behaviour when sorting Yjs deltas using a compare function that did not obey the transitive property, causing deltas to be applied incorrectly in some cases.
