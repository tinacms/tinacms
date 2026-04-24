# Public API inventory

Quick reference for what each published package exposes and **what's safe vs unsafe to touch** during dead-code cleanup. Build this into your head before acting on any fallow finding in a published package.

> **Principle:** if a symbol is reachable from a package's `src/index.ts` (or any declared `buildConfig.entryPoints`), treat it as public API. npm consumers and external services (like `tina-cloud`) may call it even when nothing in this monorepo does.

---

## Core rules

1. **Cross-monorepo grep alone is not sufficient** for published packages. The `tina-cloud` service consumes `@tinacms/graphql` (and transitively others). Zero hits in this repo ≠ zero consumers.
2. **`@deprecated` + unused is not a delete signal.** It's a "waiting for a major bump" signal. Any removal needs a changeset + semver commitment.
3. **Framework-managed class members are invisible to fallow.** Clipanion command classes (`paths`, `usage`, `catch`, `execute`), interface implementations (MediaStore's `accept`/`persist`/`list`/etc.), and AuthProvider contracts are all called via framework reflection — deleting them breaks runtime even when static analysis says "unused."
4. **Test fixtures are not dead code.** Files like `packages/@tinacms/mdx/src/next/tests/**/field.ts` export a `field` constant picked up by test-runner globs. Fallow sees "no imports" but tests use them.

---

## `tinacms` (root package — widest npm surface)

**Entry:** `src/index.ts` → `dist/index.js`

**Secondary entries** (all shipped, all public):
- `./dist/client` — client SDK
- `./react` / `./dist/react` — React hooks/components
- `./dist/rich-text` + `./dist/rich-text/static` + `./dist/rich-text/prism` — rich-text render surface

**Build entry points** (`buildConfig.entryPoints`):
- `src/index.ts`, `src/rich-text/index.tsx`, `src/rich-text/static.tsx`, `src/rich-text/prism.tsx`, `src/react.tsx`, `src/client.ts`

**What's re-exported from root index** (32 `export` lines):
- `./internalClient`, `./auth`, `./utils`, `./tina-cms`, `./toolkit`
- `useDocumentCreatorPlugin`, `TinaAdmin`, `RouteMappingPlugin`, `TinaAdminApi`, `ErrorDialog`
- `Form` (from toolkit), `MdxFieldPluginExtendible`
- Default export: `TinaCMSProvider2`
- Re-exports from `@tinacms/schema-tools`: `NAMER`, `resolveField`, `Config`, `Schema`, `Collection`, `Template`, `TinaField`, `TinaSchema`
- Deprecated type aliases: `TinaFieldEnriched`, `SchemaField` (marked `@deprecated`)

**Safe cleanup:** devDeps/deps (done — 14 removed in #upgrade/tinacms-root-drop-unused-deps).

**Unsafe without full-API review:** 235 "unused" exports, 105 type exports, 70 class members fallow flagged. Every one could be consumed by external code. Needs documentation audit before any are dropped.

---

## `@tinacms/graphql` (core resolver/database layer — tina-cloud consumer)

**Entry:** `src/index.ts` → `dist/index.js`

**Public exports** (20 `export` lines):
- **Bridges:** `FilesystemBridge`, `AuditFileSystemBridge`, `IsomorphicBridge`
- **Database:** `Database`, `createDatabaseInternal`, `createDatabase`, `createLocalDatabase`
- **Level client:** `TinaLevelClient`
- **Utilities:** `sequential`, `assertShape`, `loadAndParseWithAliases`, `stringifyFile`, `parseFile`, `scanAllContent`, `scanContentByPaths`, `transformDocument`
- **Resolution:** `resolve`, `transformDocumentIntoPayload`
- **Schema:** `createSchema`, `buildDotTinaFiles` (also aliased as `buildSchema`)
- **Git:** `getChangedFiles`, `getSha`, `shaExists`
- **Auth:** `./auth/utils` (all)
- **Error:** `./resolver/error` (all)
- **Types:** `Level`, `QueryOptions`, `OnDeleteCallback`, `OnPutCallback`, `DatabaseArgs`, `GitProvider`, `CreateDatabase`, `TinaSchema`, `TinaTemplate`, `Schema`, `Collection`

**Deprecated-but-exported class methods** on `Resolver`:
- `createResolveDocument` — `@deprecated - To be removed in next major version.`
- `resolveDocument` — `@deprecated`
- `resolveCollectionConnections` — no deprecation marker, but zero repo refs

**Safe cleanup:** duplicate `atob`/`btoa` removal (done in #upgrade/tinacms-graphql-remove-dup-utils).

**Deletion-blocker:** all `Database` / `Resolver` / `TinaGraphQLError` class methods fallow flagged are plausibly consumed by `tina-cloud`. Need that service's grep results before any removal. The 3 deprecated `Resolver` methods above are the cleanest candidates for a v3-major cleanup PR *once tina-cloud confirms*.

---

## `@tinacms/schema-tools` (validation + schema utilities)

**Entry:** `src/index.ts` → `dist/index.js`

**Public exports** (6 re-export lines):
- `./schema` (TinaSchema, etc.)
- `./types/index` — type definitions
- `./validate` — `validateTinaCloudSchemaConfig`, `TinaSchemaValidationError`, `validateSchema`
- `./util/namer`
- `./util/parseURL`
- `./util/normalizePath`

**NOT re-exported publicly:**
- `src/util/sequential.ts` — internal (barrel'd via `util/index.ts` but `util/index.ts` is not re-exported from root)
- `src/validate/schema.ts` `CollectionBaseSchema` — now demoted (#upgrade/tinacms-schema-tools-cleanup)

**Class members fallow flagged on `TinaSchema`** (6/7 have cross-package consumers despite fallow's per-workspace scan):
- `getIsTitleFieldName` (1 repo call) — keep
- `getCollectionsByName` (5 calls) — keep
- `getCollectionAndTemplateByFullPath` (1 call) — keep
- `getTemplateForData` (6 calls) — keep
- `transformPayload` (5 calls) — keep
- `matchFiles` (1 call) — keep
- `isMarkdownCollection` (0 repo calls, but central published class → likely external consumer) — unsafe to delete

---

## `@tinacms/mdx` (markdown/MDX parse+serialize)

**Entry:** `src/index.ts` → `dist/index.js`

**Public exports:**
- `parseMDX` (from `src/parse`)
- `serializeMDX` (from `src/stringify`)
- `* from './parse/plate'` (types)

**v2 rewrite status** — **important context:**
- `src/next/` contains a parallel rewrite with its own `src/next/index.ts` exposing `parseMDX` + `stringifyMDX` (renamed from `serializeMDX`).
- **The package's live public API is still the OLD `src/` code.** `src/next/` is not bundled and not shipped.
- Migration to v2 is a breaking release (public rename `serializeMDX` → `stringifyMDX`) plus cutover of internal consumers: `@tinacms/app` (rich-text/monaco), `@tinacms/graphql` (src/mdx), `tinacms` root (table.ts, code-block-element, mermaid-toolbar-button).
- Cannot be a simple "delete old" PR. Needs: keep `serializeMDX` as alias or accept breaking change → update all internal consumers → changeset → major version bump.

**Why fallow reports so many "unused" items in mdx:**
- 123 unused files: mostly `src/next/tests/**/field.ts` test fixtures picked up by the vitest glob, plus `src/next/` code not reachable from `src/index.ts`
- Duplicate exports between `src/stringify/` and `src/next/stringify/` (`assertShape`, `codeLinesToString`, `blockElement`) — both versions exist side-by-side during the migration

**Safe cleanup:** none mechanically. Everything in this package needs the v2 migration plan first.

---

## `@tinacms/search` (search indexing)

**Entry:** `src/index.ts` → `dist/index.js`

**Public exports:**
- Classes: `SearchIndexer`, `LocalSearchIndexClient`, `TinaCMSSearchIndexClient`, `FuzzyCache`, `FuzzySearchWrapper`
- Types: `SearchClient`, `SearchOptions`, `SearchResult`, `SearchQueryResponse`, `IndexableDocument`, `SearchIndexResult`, `SearchIndex`, `FuzzySearchOptions`, `FuzzyMatch`, `PaginationOptions`, `PageOptions`, `PaginationCursors`
- Functions: `levenshteinDistance`, `similarityScore`, `damerauLevenshteinDistance`, `findSimilarTerms`, `DEFAULT_FUZZY_OPTIONS`, `buildPageOptions`, `buildPaginationCursors`, `createSearchIndex`

**NOT publicly re-exported:**
- `fuzzy/distance.ts`: `getNgrams`, `ngramOverlap`, `PREFIX_MATCH_MIN_SIMILARITY` (re-exported only in `fuzzy/index.ts` which is not itself re-exported from root)

**Class members fallow flagged** — all on published classes, so any of these might be consumed externally:
- `SearchIndexer.indexContentByPaths`, `.indexAllContent`, `.deleteIndexContent`
- `FuzzySearchWrapper.clearCache`, `.getCacheSize`
- `LocalSearchIndexClient.export`

**Safe cleanup:** unused jest-* devDeps (done). The rest needs external-consumer review.

---

## `@tinacms/datalayer` (bridges + re-exports from graphql)

**Entry:** `src/index.ts` — thin re-export layer

**Public surface:** entirely re-exports from `@tinacms/graphql` for backwards compatibility (this package was originally the graphql package before a split). Plus `./backend` for its own server-side backend pieces.

**Note:** changing what `@tinacms/datalayer` re-exports is a public-API change for downstream `@tinacms/datalayer` consumers, not just `@tinacms/graphql` consumers.

---

## `@tinacms/cli` (CLI tool — NOT a library)

**Consumption pattern:** `npx @tinacms/cli <command>` or installed as a binary. **Not imported as a library** — cross-repo grep confirms zero `from '@tinacms/cli'` imports anywhere in the monorepo.

**Implication:** internal exports are genuinely internal. That's why #upgrade/tinacms-cli-drop-unused-deps could safely demote 24 exports/types.

**Framework false positives to watch for:**
- Every command class (`*Command`) has fallow-flagged members (`paths`, `usage`, `catch`, `execute`, various option-decorated properties). These are **clipanion framework conventions invoked via reflection**. Never remove.
- Anything under `src/next/commands/**/*.ts` — same pattern.

**Safe to investigate:**
- `src/cmds/forestry-migrate/util/errorSingleton.ts` — `printCollectionNameErrors` is only referenced in a commented-out line; removable but low value.
- `src/cmds/index.ts` `CLICommand.execute` — looks like an abstract base method; check subclass overrides before touching.
- `src/next/config-manager.ts` — `tinaSpaPackagePath`, `spaHTMLPath`, `printPrebuildFilePath` appear unused.

---

## Everything else (small packages)

| Package | Consumption | Cleanup pattern |
|---|---|---|
| `@tinacms/auth` | library | devDeps done |
| `@tinacms/metrics` | library, consumed by cli | 1 export demoted (`getPnpmVersion`); `Telemetry.submitRecord` is cross-package — keep |
| `@tinacms/app` | SPA bundled by cli, not library | `dummy-client.ts` referenced by CLI as a string path — never delete; virtual Vite modules (`CLIENT_IMPORT`, etc.) are false-positive "unlisted deps" |
| `@tinacms/vercel-previews`, `@tinacms/webpack-helpers` | library, currently clean | — |
| `@tinacms/scripts` | build tooling | 1 dep dropped |
| `next-tinacms-*` (azure/cloudinary/dos/s3) | library | pattern: MediaStore class method names are public API contracts; `errors.ts` constants are internal-only and demotable; `handlers.ts` + `auth.ts` + `delivery-handlers.ts` are declared build entry points — not dead |
| `tinacms-authjs`, `tinacms-clerk`, `tinacms-gitprovider-github` | library | same "published → treat as public API" rules |
| `create-tina-app` | CLI tool | internal exports safely demotable (same logic as @tinacms/cli) |

---

## Known rebuild patterns

- **"Unused file" flagged on a `.test.ts` / `.spec.ts`** — test-runner glob, not dead.
- **"Unused file" flagged on a file listed in `package.json` `buildConfig.entryPoints`** — it's a declared entry, not dead. (Examples: `next-tinacms-dos/src/handlers.ts`, `tinacms-clerk/src/tinacms.ts`, `next-tinacms-azure/src/{auth,delivery-handlers,handlers}.ts`.)
- **"Unused file" flagged on a file referenced by string path** — fallow can't see those. (Example: `@tinacms/app/src/dummy-client.ts` referenced by `@tinacms/cli` Vite shim config.)
- **"Unused class member" on a framework-managed class** — reflection target. (Examples: clipanion commands, MediaStore implementations, TinaCMS plugins registered by string key.)
- **"Unused dep"** referenced in a package.json `scripts` entry — fallow greps source files only. Check `scripts` fields too (example: `tsc-alias` in `tinacms`, `typedoc-plugin-markdown` in `@tinacms/mdx`).

---

## How to extend this document

When you discover a new false-positive pattern or clear a public-API question, add it here. Each entry should answer: **what was flagged, why it's actually in use, and how future readers can recognize the pattern.**
