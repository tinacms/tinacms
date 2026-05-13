---
"@tinacms/cli": minor
"@tinacms/schema-tools": minor
---

Fix native SQLite (and other native CJS adapters) crashing the ESM database build, plus surrounding cleanup work.

**The bug.** Since Tina v3's December 2025 ESM migration, bundling `tina/database.ts` with esbuild — and writing the output to `os.tmpdir()` — left users wedged between two failure modes: bundling native modules like `better-sqlite3` crashed with `__filename is not defined`, and externalizing them couldn't resolve `node_modules` from `/tmp/`. See #6675.

**What changed:**

- `loadDatabaseFile` and `loadConfigFile` now write esbuild output to `<project>/tina/__generated__/.cache/<timestamp>/` instead of `os.tmpdir()`, so Node's resolver can walk up to the project's `node_modules` at runtime.
- `better-sqlite3` is externalized so Node loads it as CJS where `__filename` exists.
- The build cache is swept on startup (clears residue from crashed prior runs), and each per-build subdir + its now-empty timestamp parent are removed after the dynamic-import resolves.
- Read-only project mounts (Docker `:ro` volumes, AWS Lambda's `/var/task`, sandboxed CI runners) now fail with an actionable error explaining the cause and resolution, instead of a cryptic mid-build `EACCES`.
- New `defineConfig` field: `build.externalDependencies?: string[]`. Users with custom native adapters outside the baseline can extend the externalize list from their config:

  ```ts
  // tina/config.ts
  export default defineConfig({
    build: {
      publicFolder: 'public',
      outputFolder: 'admin',
      externalDependencies: ['my-custom-native-adapter'],
    },
    // ...
  });
  ```

  Externalized packages must be installed in the project's `node_modules` so Node can resolve them at runtime.
- `tina init` now adds `tina/__generated__` to `.gitignore` for new projects (and existing projects without it).
