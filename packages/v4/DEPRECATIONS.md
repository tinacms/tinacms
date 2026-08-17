# v4 deprecations

v4 does not release the packages in this file. [`README.md`](./README.md) gives
the packages that v4 releases. Each row below records the decision, the v4
replacement if one exists, and the migration path for users.

Status values:

- **deprecate** — Keep the package on npm. Add the `deprecated` field to
  `package.json`. Stop the feature work. Move the capability into a v4 package
  that stays. The source code stays in the monorepo until the new package has
  the capability.
- **remove** — Delete the package from the monorepo. The applications do not use
  it. v3 users keep the last v3 version permanently.
- **fold** — Move the capability into a v4 package that stays. npm gets no
  replacement package.

## Decision table

| Current package (workspace path) | Status | v4 replacement | Migration path |
|---|---|---|---|
| `@tinacms/datalayer` (`packages/@tinacms/datalayer`) | deprecate, then fold | `@tinacms/tinacms` (`src/store/` and the local-content plugin), and the Level adapters in other repositories: `mongodb-level`, `sqlite-level`, `upstash-redis-level`. | A self-hosted app that uses `@tinacms/datalayer` directly must change to the correct Level adapter and to the local-content plugin in `@tinacms/tinacms`. |
| `@tinacms/metrics` (`packages/@tinacms/metrics`) | deprecate, then fold | The v4 CLI in `@tinacms/tinacms`, and the runtime internals. | No user action is necessary. The package is internal only. v4 supplies the same telemetry through the CLI. |
| `@tinacms/schema-tools` (`packages/@tinacms/schema-tools`) | deprecate, then fold | The schema helper functions move into `@tinacms/tinacms`: the `t` helper functions of the universal entry, and the codegen module. | Replace `import { ... } from '@tinacms/schema-tools'` with the equivalent export from `@tinacms/tinacms`. |
| `@tinacms/scripts` (`packages/@tinacms/scripts`) | deprecate, but keep private | The monorepo keeps it as a private build tool. The team adds `"private": true` and stops the release. | None. This is internal tooling. The v4 packages continue to use `tinacms-scripts build` until they move to `tsup`. |
| `@tinacms/vercel-previews` (`packages/@tinacms/vercel-previews`) | deprecate, then fold | `@tinacms/bridge` gets the preview code, with the other visual-editing functions. | Use the preview helper functions in `@tinacms/bridge`. |
| `@tinacms/cli` (`packages/@tinacms/cli`) | deprecate | `@tinacms/tinacms` gets the code, and the `tinacms` bin moves with it. | Install `@tinacms/tinacms` in place of `@tinacms/cli`. The `tinacms` command does not change. |
| `@tinacms/react-modals` *(not in the monorepo HEAD now)* | remove | None. | Use the Headless UI primitives or the Radix primitives through the admin shell of `@tinacms/app`. |
| `@tinacms/react-screens` *(not in the monorepo HEAD now)* | remove | None. | Use the v4 admin shell in `@tinacms/tinacms`. |
| `@tinacms/sharedctx` *(not in the monorepo HEAD now)* | remove | None. | The v4 Zustand store composer replaces the shared-context pattern. |
| `@tinacms/toolkit` *(not in the monorepo HEAD now)* | remove | None. | The v4 admin shell replaces the toolkit: `@tinacms/app` and `@tinacms/tinacms/react`. |
| `@tinacms/webpack-helpers` (`packages/@tinacms/webpack-helpers`) | remove | None. | v4 releases ESM only. The supported adapters (`next`, `astro`, `express`, `hono`) do not need webpack helper functions. |
| `@tinacms/core` *(a workspace directory, but no released package)* | remove | None. | The internal core is in `@tinacms/tinacms/src/core/`. |
| `@tinacms/ui` *(a workspace directory, but no released package)* | remove | None. | The admin UI is in `@tinacms/app`. |
| `react-tinacms-editor` *(not in the monorepo HEAD now)* | remove | None. | Use the v4 rich-text field in `@tinacms/tinacms`. |
| `tina-cloud-next` *(not in the monorepo HEAD now)* | remove | None. | `@tinacms/tinacms/adapters/next` supplies the TinaCloud integration. |
| `tina-graphql` *(not in the monorepo HEAD now)* | remove | `@tinacms/graphql` | Change the import. |
| `tina-graphql-gateway` *(not in the monorepo HEAD now)* | remove | None. | Use `@tinacms/graphql` directly, or use the TinaCloud API. |
| `tina-graphql-gateway-cli` *(not in the monorepo HEAD now)* | remove | None. | Use the `tinacms` CLI in `@tinacms/tinacms`. |
| `tina-graphql-helpers` *(not in the monorepo HEAD now)* | remove | None. | Use the types and the helper functions in `@tinacms/graphql`. |
| `tina-graphql-primitives` *(not in the monorepo HEAD now)* | remove | None. | Use the primitives in `@tinacms/graphql`. |

> The table also lists the packages that are not in the monorepo HEAD now. The
> first review named them in the product backlog item, thus this list keeps the
> record complete. This branch does not contain them. Make sure that no person
> adds them again.

## The deprecation procedure

1. On the v4 branch, add a `deprecated` field to the `package.json` file of each
   package in the tree above. npm shows this field at installation.
2. Change the `description` field of each of those packages to point to the
   replacement. This file specifies the text of the `deprecated` field.
3. When a v4 package gets the related capability, open the changeset. The
   changeset releases the final v3 patch version. Its release notes link to this
   file.
4. When a replacement has one stable release, delete the source code of each
   package with the status **remove**. Keep its row in this file, so that the
   migration path stays available.

## The result for users

- `pnpm install` continues to operate correctly for a v3 project that pins
  `@tinacms/datalayer@2.x`. npm shows the deprecation message from step 1.
- `pnpm install` for a v4 project that depends on `@tinacms/tinacms` gets one
  tree. That tree does not refer to the deprecated packages.
- An upgrade from v3 to v4 needs one change in `package.json`: `tinacms` becomes
  `@tinacms/tinacms`. Then rewrite the imports that the rows above specify. This
  upgrade is not a replacement of many packages at the same time.
