# v4 deprecations

Packages listed here are **not** part of the v4 publish surface defined in
[`README.md`](./README.md). Each row records the decision, the v4 successor
(if any), and the migration path for consumers.

Status values:

- **deprecate** — keep on npm, mark `deprecated` in package.json, stop
  feature work, fold capability into a retained v4 package. Source remains
  in the monorepo until the absorbing package replaces it.
- **remove** — delete from the monorepo. Already unused at the application
  surface; v3 consumers will get the final v3 version forever.
- **fold** — capability moves into a retained v4 package; no public npm
  successor.

## Decision table

| Current package (workspace path) | Status | v4 successor / replacement | Migration path |
|---|---|---|---|
| `@tinacms/datalayer` (`packages/@tinacms/datalayer`) | deprecate → fold | Folded into `@tinacms/tinacms` (`src/store/` and the local-content plugin) and the cross-repo Level adapters (`mongodb-level`, `sqlite-level`, `upstash-redis-level`). | Self-hosted apps using `@tinacms/datalayer` directly switch to the matching Level adapter and the local-content plugin in `@tinacms/tinacms`. |
| `@tinacms/metrics` (`packages/@tinacms/metrics`) | deprecate → fold | Folded into the v4 CLI inside `@tinacms/tinacms` and runtime internals. | No consumer action — package is internal-only today; v4 ships the same telemetry behind the CLI. |
| `@tinacms/schema-tools` (`packages/@tinacms/schema-tools`) | deprecate → fold | Schema helpers move into `@tinacms/tinacms` (the universal entry's `t` helpers and the codegen module). | Replace `import { ... } from '@tinacms/schema-tools'` with the equivalent re-export from `@tinacms/tinacms`. |
| `@tinacms/scripts` (`packages/@tinacms/scripts`) | deprecate (keep private) | Retained as a private build tool for the monorepo only. Will be marked `"private": true` and dropped from publish. | None — internal tooling. v4 packages keep using `tinacms-scripts build` until they migrate to `tsup` directly. |
| `@tinacms/vercel-previews` (`packages/@tinacms/vercel-previews`) | deprecate → fold | Preview wiring folded into `@tinacms/bridge` (the visual-editing/preview story). | Replace usage with `@tinacms/bridge` preview helpers. |
| `@tinacms/cli` (`packages/@tinacms/cli`) | deprecate | Folded into `@tinacms/tinacms` — the `tinacms` bin moves with it. | Install `@tinacms/tinacms` instead of `@tinacms/cli`; the `tinacms` command is unchanged. |
| `@tinacms/react-modals` *(not currently in monorepo HEAD)* | remove | None. | Use Headless UI / Radix primitives via `@tinacms/app`'s admin shell. |
| `@tinacms/react-screens` *(not currently in monorepo HEAD)* | remove | None. | Use the v4 admin shell in `@tinacms/tinacms`. |
| `@tinacms/sharedctx` *(not currently in monorepo HEAD)* | remove | None. | The v4 Zustand store composer replaces the shared-context pattern. |
| `@tinacms/toolkit` *(not currently in monorepo HEAD)* | remove | None. | The v4 admin shell (`@tinacms/app` + `@tinacms/tinacms/react`) replaces the toolkit. |
| `@tinacms/webpack-helpers` (`packages/@tinacms/webpack-helpers`) | remove | None. | v4 ships ESM-only; no webpack-specific helpers are needed for the supported adapters (`next`, `astro`, `express`, `hono`). |
| `@tinacms/core` *(workspace dir present, no published package)* | remove | None. | Internal core lives in `@tinacms/tinacms/src/core/`. |
| `@tinacms/ui` *(workspace dir present, no published package)* | remove | None. | Admin UI lives in `@tinacms/app`. |
| `react-tinacms-editor` *(not in monorepo HEAD)* | remove | None. | Use the v4 rich-text field in `@tinacms/tinacms`. |
| `tina-cloud-next` *(not in monorepo HEAD)* | remove | None. | TinaCloud integration is provided by `@tinacms/tinacms/next`. |
| `tina-graphql` *(not in monorepo HEAD)* | remove | `@tinacms/graphql` | Replace import. |
| `tina-graphql-gateway` *(not in monorepo HEAD)* | remove | None. | Use `@tinacms/graphql` directly or the TinaCloud API. |
| `tina-graphql-gateway-cli` *(not in monorepo HEAD)* | remove | None. | Use the `tinacms` CLI in `@tinacms/tinacms`. |
| `tina-graphql-helpers` *(not in monorepo HEAD)* | remove | None. | Use `@tinacms/graphql` types/helpers. |
| `tina-graphql-primitives` *(not in monorepo HEAD)* | remove | None. | Use `@tinacms/graphql` primitives. |

> "Not currently in monorepo HEAD" packages are listed for traceability against
> the PBI — they were named in the original review. They are already absent
> from this branch, so the action is to confirm they are not reintroduced.

## Process for the deprecation rollout

1. On the v4 branch, mark each in-tree package above with a `deprecated`
   field in its `package.json` (npm displays this on install) and update its
   `description` to point at the successor. This file is the source of truth
   for what the `deprecated` string should say.
2. When the absorbing v4 package gains the corresponding capability, open
   the changeset that flips the v3 package to a final patch release whose
   release notes link here.
3. Once a successor has shipped one stable release, delete the in-tree
   source for packages marked **remove**. Leave a tombstone entry in this
   file so the migration path stays discoverable.

## Removed vs frozen — what consumers see

- `pnpm install` on a v3 project that pins `@tinacms/datalayer@2.x`
  continues to succeed; npm displays the deprecation message added in step
  1 above.
- `pnpm install` on a v4 project that depends on `@tinacms/tinacms` will
  pull a single tree that no longer references the deprecated packages.
- A v3 → v4 upgrade is a single `package.json` change (`tinacms` →
  `@tinacms/tinacms`) plus per-import rewrites driven by the rows above; it
  is not a coordinated multi-package replace.
