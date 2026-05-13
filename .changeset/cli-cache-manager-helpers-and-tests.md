---
"@tinacms/cli": patch
---

Extract the cache-manager logic from `config-manager.ts` into a dedicated `cache-manager.ts` helper module with full unit-test coverage:

- `prepareCacheLocation()` — sweep stale residue + verify writability + reserve a fresh per-build dir
- `reapBuildSubdir()` — remove a per-load subdir and reap the timestamp parent if empty
- `buildReadOnlyMountErrorMessage()` — the actionable error thrown on read-only project mounts

Adds 13 new tests covering the startup sweep, crash-residue tolerance, read-only mount error contract (chmod-based test, skipped on Windows), per-load subdir cleanup, sibling-load coexistence, and the empty-parent reap invariant.
