# TinaCMS v4 package surface

This directory is the v4 scaffold. It exists alongside the v3 packages at the
top of `packages/` so v3 can continue shipping fixes while v4 is built out.

The v4 architectural spec lives at
[github.com/tinacms/tinacmsv4-docs](https://github.com/tinacms/tinacmsv4-docs) —
start at
[`CONTEXT.md`](https://github.com/tinacms/tinacmsv4-docs/blob/main/CONTEXT.md)
and the
[ADR set](https://github.com/tinacms/tinacmsv4-docs/tree/main/adr). This
file is the **repo-level package-map**: what ships, what is being deprecated,
where moved integrations are going, and who owns the build/publish boundary
for each.

---

## v3 vs v4 publishing layout

| Layer | v3 (today) | v4 |
|---|---|---|
| Root runtime npm name | `tinacms` | `@tinacms/tinacms` |
| Workspace path | `packages/tinacms` | `packages/v4/@tinacms/tinacms` |
| Release status | **Support mode** — bug fixes only | Pre-release (`4.0.0-alpha.x`), `private: true` until alpha publish |
| CLI surface | `@tinacms/cli` (separate package, `tinacms` bin) | Folded into `@tinacms/tinacms` (`tinacms` bin still provided) |

The v3 `tinacms` package stays where it is. It is not renamed, not deprecated,
and not republished as a redirect — v3 users keep installing `tinacms@3.x` and
continue receiving security/regression fixes from the `main` branch. v4 ships
under a brand-new npm name (`@tinacms/tinacms`) so the v3 listing on npm
doesn't read as abandoned and so the two majors can co-exist on a project
during migration.

## Retained v4 package surface

These are the packages that v4 actively publishes. Build/publish boundaries
listed are the rules a reviewer should enforce when accepting PRs that touch
them.

| Package | Path | Role | Build | Publishes |
|---|---|---|---|---|
| `@tinacms/tinacms` | `packages/v4/@tinacms/tinacms` | v4 runtime — universal entry plus subpath entries (`/react`, `/client`, `/server`, `/next`, `/express`, `/astro`, `/hono`). Includes the operational CLI (`tinacms` bin: `init`, `dev`, `build`, `codegen`). | TBD (alpha scaffold uses `src/*` directly via `exports`); production build will compile to `dist/` per ADR-001. | npm `@tinacms/tinacms` |
| `@tinacms/app` | `packages/@tinacms/app` | Admin app bundle consumed by `@tinacms/tinacms` at build/dev time. | `tinacms-scripts build` | npm `@tinacms/app` |
| `@tinacms/auth` | `packages/@tinacms/auth` | Shared auth primitives used by core and TinaCloud. | `tinacms-scripts build` | npm `@tinacms/auth` |
| `@tinacms/graphql` | `packages/@tinacms/graphql` | GraphQL runtime — shared with TinaCloud. | `tinacms-scripts build` | npm `@tinacms/graphql` |
| `@tinacms/search` | `packages/@tinacms/search` | Search engine used by the local-search plugin and TinaCloud. | `tinacms-scripts build` | npm `@tinacms/search` |
| `@tinacms/mdx` | `packages/@tinacms/mdx` | MDX / rich-text parse + serialize. Used by `@tinacms/app`, `@tinacms/bridge`, `@tinacms/astro`. | `tinacms-scripts build` | npm `@tinacms/mdx` |
| `@tinacms/bridge` | `packages/@tinacms/bridge` | Visual-editing bridge helpers (from the Astro adapter spike). | `tsup` | npm `@tinacms/bridge` |
| `@tinacms/astro` | `packages/@tinacms/astro` | Astro adapter (from the Astro adapter spike). | `tsup` + `.astro` source files | npm `@tinacms/astro` |
| `create-tina-app` | `packages/create-tina-app` | Standalone scaffolding CLI — clones starter templates. Not folded into `@tinacms/tinacms`; it must be installable without the runtime. | `tsup` | npm `create-tina-app` |

### Cross-repo Level adapters (kept, not in this repo)

These already live in their own repos and stay there. They are listed for
completeness so a reviewer doesn't try to move them in.

| Package | Repository |
|---|---|
| `mongodb-level` | https://github.com/tinacms/mongodb-level |
| `sqlite-level` | https://github.com/tinacms/sqlite-level |
| `upstash-redis-level` | https://github.com/tinacms/upstash-redis-level |

## Publish boundary rules

- `@tinacms/tinacms` is the only v4 package that ships a CLI bin. The legacy
  `@tinacms/cli` bin (`tinacms`) is being absorbed into it; both must not
  publish the same bin name in the same major.
- `@tinacms/app` is a build/dev-time dependency of `@tinacms/tinacms`. It
  does not appear in a v4 consumer's `package.json` directly.
- `@tinacms/graphql`, `@tinacms/search`, `@tinacms/auth`, `@tinacms/mdx` are
  shared with TinaCloud. PRs that change their public surface need a
  TinaCloud-side check, not just a monorepo check.
- `@tinacms/bridge` and `@tinacms/astro` are the only packages that can
  publish framework-specific source (`.astro`). Other v4 packages compile to
  plain ESM `dist/`.
- `create-tina-app` must not depend on any `@tinacms/*` workspace package —
  it has to install cleanly into an empty directory.

## Ownership

All v4 packages above are owned by the TinaCMS core team
(`@tinacms/tinacms` on GitHub). The integration packages being moved out
(see below) transfer to TinaCMS-owned repos so that ownership and CODEOWNERS
match the publish boundary.

---

## Deprecation and migration paths

See [`DEPRECATIONS.md`](./DEPRECATIONS.md) for the deprecated/removed package
list and [`INTEGRATIONS.md`](./INTEGRATIONS.md) for the provider/integration
packages being moved to their own repos.

A package marked "deprecated" here remains installable from npm and continues
to receive security fixes during the v3 support window. It will not receive
feature work and is not part of the v4 publish surface.

A package marked "removed" will have its source deleted from this monorepo
once the v4 runtime no longer references it and once any in-flight migration
guidance is in place.

A package marked "moved" will keep its current npm name (so existing
installs continue to work) but its source-of-truth repo changes. The
monorepo copy will be archived after the new repo's first release.
