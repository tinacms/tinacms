# @tinacms/metrics

## 2.1.0

### Minor Changes

- [#6738](https://github.com/tinacms/tinacms/pull/6738) [`4d0c37a`](https://github.com/tinacms/tinacms/commit/4d0c37a8a50b211b7c5070c370faa369ee5d260d) Thanks [@joshbermanssw](https://github.com/joshbermanssw)! - Stop writing generated files (`_schema.json`, `_graphql.json`, `_lookup.json`, `tina-lock.json`) to the content repo when `localContentPath` is set. Generated files now live only in the generator repo's `tina/__generated__/`. The content repo is no longer required to contain a `tina/` folder. `FilesystemBridge.get` / `put` / `delete` now route `tina/__generated__/` and `.tina/__generated__/` paths to `rootPath` (the generator) instead of `outputPath` (the content root). Closes [tinacms/tinacloud#3295](https://github.com/tinacms/tinacloud/issues/3295).

  ### ⚠️ Rollout gate

  **This release must not be promoted to the `@latest` dist-tag until TinaCloud prod has deployed [tinacms/tinacloud#3403](https://github.com/tinacms/tinacloud/issues/3403).** Pre-#3403 TinaCloud reads `tina-lock.json` from the content repo on generator pushes; shipping this change before the server-side fix breaks every existing multi-repo user's indexing.

  ### Migration notes for existing multi-repo projects

  After upgrading (and once TinaCloud prod is on #3403):

  - **Stale `tina/` folder in your content repo.** Pre-upgrade builds committed `tina/__generated__/*` and `tina/tina-lock.json` to the content repo. Nothing updates or reads those files any more. They are safe — and recommended — to delete from the content repo in a single cleanup commit.
  - **`ConfigManager.generatedFolderPathContentRepo` is removed.** If any custom CLI code, plugins, or scripts referenced this field, they will fail at type-check or runtime. Use `generatedFolderPath` — it has always been the generator-relative path.
  - **`ConfigManager.getTinaFolderPath` no longer accepts an `isContentRoot` option.** The content root never needs a `tina/` folder now, so the option was removed. If any custom code called `getTinaFolderPath(path, { isContentRoot: true })`, drop the second argument.
  - **`FilesystemBridge` behavior change for `tina/__generated__/` paths.** In multi-repo setups, bridge reads/writes of paths under `tina/__generated__/` or `.tina/__generated__/` now resolve against the generator (`rootPath`) rather than the content repo (`outputPath`). If you have custom bridge subclasses or code that relied on these paths resolving to the content repo, update it.
  - **Generated `client.ts` / `database-client.ts` now import `./types` extensionless** (was `./types.ts`) for TypeScript projects. Avoids requiring `allowImportingTsExtensions: true` in consumer tsconfigs, which broke the build under Next.js 15.5+ defaults. JS projects still import `./types.js` (Node ESM requires the extension).

## 2.0.1

### Patch Changes

- [#6216](https://github.com/tinacms/tinacms/pull/6216) [`5c1e891`](https://github.com/tinacms/tinacms/commit/5c1e89181f595d392ad6cb56ca5fc0b6d9e60a23) Thanks [@JackDevAU](https://github.com/JackDevAU)! - - `@tinacms/graphql`: remove scmp dependency, replaced with modern code (now inbuilt)
  - `@tinacms/metrics`: remove isomorphic-fetch dependency, now relies on global fetch
  - `@tinacms/cli`: remove log4js dependency, replaced with custom logger implementation; update chalk to v5 (ESM-only)
  - `@tinacms/scripts`, `create-tina-app`: update chalk to v5 (ESM-only)
  - `next-tinacms-azure`: Buffer to Uint8Array conversion
  - `tinacms`: TypeScript style prop typing

## 2.0.0

### Major Changes

- [#5982](https://github.com/tinacms/tinacms/pull/5982) [`2e1535d`](https://github.com/tinacms/tinacms/commit/2e1535dd5495dc390902f2db6ef1f26afb072396) Thanks [@brookjeynes-ssw](https://github.com/brookjeynes-ssw)! - feat: migrate from commonjs to esm

## 1.1.0

### Minor Changes

- [#5744](https://github.com/tinacms/tinacms/pull/5744) [`98a61e2`](https://github.com/tinacms/tinacms/commit/98a61e2d263978a7096cc23ac7e94aa0039981be) Thanks [@Ben0189](https://github.com/Ben0189)! - Upgrade Plate editor to v48 beta, integrating latest features and improvements.

## 1.0.9

### Patch Changes

- [#5486](https://github.com/tinacms/tinacms/pull/5486) [`d7c5ec1`](https://github.com/tinacms/tinacms/commit/d7c5ec1b174419dcc6ddba3cfb3684dd469da571) Thanks [@JackDevAU](https://github.com/JackDevAU)! - Update dependencies across packages

## 1.0.8

### Patch Changes

- [#5276](https://github.com/tinacms/tinacms/pull/5276) [`f90ef4d`](https://github.com/tinacms/tinacms/commit/f90ef4d92ae7b21c8c610d14af9510354a3969c6) Thanks [@Ben0189](https://github.com/Ben0189)! - Updates minor and patch dependencies

## 1.0.7

### Patch Changes

- [#4843](https://github.com/tinacms/tinacms/pull/4843) [`4753c9b`](https://github.com/tinacms/tinacms/commit/4753c9b53854d19212229f985bc445b2794fad9a) Thanks [@JackDevAU](https://github.com/JackDevAU)! - ⬆️ Update Minor & Patch Dependencies Versions

## 1.0.6

### Patch Changes

- [#4804](https://github.com/tinacms/tinacms/pull/4804) [`d08053e`](https://github.com/tinacms/tinacms/commit/d08053e758b6910afa8ab8952a40984921cccbc4) Thanks [@dependabot](https://github.com/apps/dependabot)! - ⬆️ Updates Typescript to v5.5, @types/node to v22.x, next.js to latest version 14.x, and removes node-fetch

## 1.0.5

### Patch Changes

- e58b951: update vulnerable packages so npm audit does not complain
- 9076d09: update next js version from 12 to 14 in tinacms packages

## 1.0.4

### Patch Changes

- 2940594: Add pnpm option to create-tina-app

## 1.0.3

### Patch Changes

- 0503072: update ts, remove rimraf, fix types
- dffa355: Remove yarn for pnpm

## 1.0.2

### Patch Changes

- efd56e769: Remove license headers

## 1.0.1

### Patch Changes

- 4ebc44068: Add a migration tool for forestry users

## 1.0.0

### Major Changes

- 958d10c82: Tina 1.0 Release

  Make sure you have updated to th "iframe" path: https://tina.io/blog/upgrading-to-iframe/

## 0.0.3

### Patch Changes

- ef450a53a: - Update tinacms CLI to support schemaFileType option (default 'ts') to allow user to specify the schema file type
  - Update telemetry module to optionally check NO_TELEMETRY environment variable for disabling telemetry

## 0.0.2

### Patch Changes

- 8bf0ac832: Update the shape of the mertics payload
- a05546eb4: Added basic open source telemetry

  See [this discussion](https://github.com/tinacms/tinacms/discussions/2451) for more information and how to opt out.
