---
"@tinacms/cli": minor
"@tinacms/graphql": minor
"@tinacms/metrics": minor
---

Stop writing generated files (`_schema.json`, `_graphql.json`, `_lookup.json`, `tina-lock.json`) to the content repo when `localContentPath` is set. Generated files now live only in the generator repo's `tina/__generated__/`. The content repo is no longer required to contain a `tina/` folder. `FilesystemBridge.get` / `put` / `delete` now route `tina/__generated__/` and `.tina/__generated__/` paths to `rootPath` (the generator) instead of `outputPath` (the content root). Closes [tinacms/tinacloud#3295](https://github.com/tinacms/tinacloud/issues/3295).

### ⚠️ Rollout gate

**This release must not be promoted to the `@latest` dist-tag until TinaCloud prod has deployed [tinacms/tinacloud#3403](https://github.com/tinacms/tinacloud/issues/3403).** Pre-#3403 TinaCloud reads `tina-lock.json` from the content repo on generator pushes; shipping this change before the server-side fix breaks every existing multi-repo user's indexing.

### Migration notes for existing multi-repo projects

After upgrading (and once TinaCloud prod is on #3403):

- **Stale `tina/` folder in your content repo.** Pre-upgrade builds committed `tina/__generated__/*` and `tina/tina-lock.json` to the content repo. Nothing updates or reads those files any more. They are safe — and recommended — to delete from the content repo in a single cleanup commit.
- **`ConfigManager.generatedFolderPathContentRepo` is removed.** If any custom CLI code, plugins, or scripts referenced this field, they will fail at type-check or runtime. Use `generatedFolderPath` — it has always been the generator-relative path.
- **`ConfigManager.getTinaFolderPath` no longer accepts an `isContentRoot` option.** The content root never needs a `tina/` folder now, so the option was removed. If any custom code called `getTinaFolderPath(path, { isContentRoot: true })`, drop the second argument.
- **`FilesystemBridge` behavior change for `tina/__generated__/` paths.** In multi-repo setups, bridge reads/writes of paths under `tina/__generated__/` or `.tina/__generated__/` now resolve against the generator (`rootPath`) rather than the content repo (`outputPath`). If you have custom bridge subclasses or code that relied on these paths resolving to the content repo, update it.
- **Generated `client.ts` / `database-client.ts` now import `./types` extensionless** (was `./types.ts`) for TypeScript projects. Avoids requiring `allowImportingTsExtensions: true` in consumer tsconfigs, which broke the build under Next.js 15.5+ defaults. JS projects still import `./types.js` (Node ESM requires the extension).
