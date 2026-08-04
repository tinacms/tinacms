# TinaCMS v4 packages

This directory contains the v4 scaffold. It is adjacent to the v3 packages at
the top of `packages/`. Thus the team can release v3 fixes while it builds v4.

The v4 architecture specification is in a different repository,
[github.com/tinacms/tinacmsv4-docs](https://github.com/tinacms/tinacmsv4-docs).
Start at
[`CONTEXT.md`](https://github.com/tinacms/tinacmsv4-docs/blob/main/CONTEXT.md),
then read the
[ADR set](https://github.com/tinacms/tinacmsv4-docs/tree/main/adr).

This file is the package map for the repository. It gives this data:

- the packages that v4 releases
- the packages that become deprecated
- the new location of each integration package that moves
- the team that controls the build boundary and the publish boundary

---

## The v3 layout and the v4 layout

| Layer | v3 (now) | v4 |
|---|---|---|
| npm name of the root runtime | `tinacms` | `@tinacms/tinacms` |
| Workspace path | `packages/tinacms` | `packages/v4/@tinacms/tinacms` |
| Release status | **Support mode.** Bug fixes only. | Pre-release (`4.0.0-alpha.x`). `private: true` until the alpha release. |
| CLI | `@tinacms/cli`, a different package that supplies the `tinacms` bin | Part of `@tinacms/tinacms`, which also supplies the `tinacms` bin |

The v3 `tinacms` package stays in its current location. The team does not change
its name. The team does not make it deprecated, and does not release it again as
a redirect. v3 users continue to install `tinacms@3.x`. They also continue to
get security fixes and regression fixes from the `main` branch.

v4 releases with a new npm name, `@tinacms/tinacms`. The new name has two
purposes. It shows npm users that the team continues to support v3. It also lets
one project use the two major versions together during migration.

## The v4 packages that stay

v4 releases the packages in this table. A reviewer must apply the build rule and
the publish rule for a package when a pull request changes that package.

| Package | Path | Role | Build | Releases to |
|---|---|---|---|---|
| `@tinacms/tinacms` | `packages/v4/@tinacms/tinacms` | The v4 runtime. It supplies the universal entry and the subpath entries (`/react`, `/client`, `/server`, `/next`, `/express`, `/astro`, `/hono`). It also contains the CLI. The `tinacms` bin supplies the `init` and `codegen` commands. It does not supply `dev` or `build`; refer to [The CLI stays out of the pipeline](#the-cli-stays-out-of-the-pipeline). | Not decided. The alpha scaffold uses `src/*` directly through `exports`. ADR-001 specifies that the production build compiles to `dist/`. | npm `@tinacms/tinacms` |
| `@tinacms/app` | `packages/@tinacms/app` | The admin app bundle. `@tinacms/tinacms` uses it at build time and at development time. | `tinacms-scripts build` | npm `@tinacms/app` |
| `@tinacms/auth` | `packages/@tinacms/auth` | Shared auth primitives. The core packages and TinaCloud use them. | `tinacms-scripts build` | npm `@tinacms/auth` |
| `@tinacms/graphql` | `packages/@tinacms/graphql` | The GraphQL runtime. TinaCloud also uses it. | `tinacms-scripts build` | npm `@tinacms/graphql` |
| `@tinacms/search` | `packages/@tinacms/search` | The search engine. The local-search plugin and TinaCloud use it. | `tinacms-scripts build` | npm `@tinacms/search` |
| `@tinacms/mdx` | `packages/@tinacms/mdx` | It parses MDX and rich text, and it writes them again. `@tinacms/app`, `@tinacms/bridge`, and `@tinacms/astro` use it. | `tinacms-scripts build` | npm `@tinacms/mdx` |
| `@tinacms/bridge` | `packages/@tinacms/bridge` | Helper functions for the visual-editing bridge. They come from the Astro adapter trial. | `tsup` | npm `@tinacms/bridge` |
| `@tinacms/astro` | `packages/@tinacms/astro` | The Astro adapter. It comes from the Astro adapter trial. | `tsup`, plus the `.astro` source files | npm `@tinacms/astro` |
| `create-tina-app` | `packages/create-tina-app` | An independent CLI that copies starter templates. It is not part of `@tinacms/tinacms`, because a user must be able to install it without the runtime. | `tsup` | npm `create-tina-app` |

### Level adapters in other repositories

These adapters are already in their own repositories, and they stay there. This
list prevents a reviewer from moving them into this repository.

| Package | Repository |
|---|---|
| `mongodb-level` | https://github.com/tinacms/mongodb-level |
| `sqlite-level` | https://github.com/tinacms/sqlite-level |
| `upstash-redis-level` | https://github.com/tinacms/upstash-redis-level |

## The CLI stays out of the pipeline

v3 owns the pipeline of the project. `tinacms dev -c "next dev"` makes Tina the
parent process of the framework, and `tinacms build && next build` makes Tina a
build step. Thus a fault in Tina, or a build tool in Tina that does not agree
with the one in the project, stops a build that has nothing to do with content.
It is also the reason that `tinacms` and `@tinacms/cli` move together: two
packages in one pipeline must agree at each release.

v4 inverts that. The project owns its pipeline, and it calls Tina.

**The rule: the `tinacms` bin only writes files into the repository that a person
then commits. It does not wrap a process, it does not open a port, and it does
not produce a build artifact.**

The rule gives the commands that the bin can supply:

| Command | What it writes | Allowed |
|---|---|---|
| `tinacms init` | `tina/config.ts`, the plugin registration, the admin route | Yes |
| `tinacms codegen` | `tina/tina-lock.json` | Yes |
| `tinacms codegen --check` | nothing; it exits 1 when the committed lock is stale | Yes |
| `tinacms dev` | — | No. Run the dev server of the framework. The Vite plugin and the adapter do the rest. |
| `tinacms build` | — | No. The lock is committed, so there is nothing to build. |

Each capability therefore mounts into the server that the project already runs:

- The local data layer is a Vite plugin that the project adds to its own config,
  or an adapter route. `dispatchContentRequest` belongs to no transport, so a
  host for another bundler is a small file.
- The RPC handler is `(Request) => Promise<Response>`. The framework adapters
  mount it as a route of the project.
- The admin UI is a React component that the project renders on its own route.
  It is not a bundle that a build step copies into `public/`.

`tina-lock.json` is a committed file and not a build output (ADR-016). Thus CI
and the deploy of a project never run the `tinacms` bin. `tinacms codegen
--check` is available as a guard against drift, and it stays a check that a
project opts into.

## Publish rules

- `@tinacms/tinacms` is the only v4 package that supplies a CLI bin.
  `@tinacms/tinacms` absorbs the legacy `@tinacms/cli` bin, `tinacms`. Two
  packages must not release the same bin name in the same major version.
- `@tinacms/app` is a dependency of `@tinacms/tinacms` at build time and at
  development time. It does not occur in the `package.json` file of a v4 user.
- TinaCloud also uses `@tinacms/graphql`, `@tinacms/search`, `@tinacms/auth`,
  and `@tinacms/mdx`. If a pull request changes their public API, do a check in
  TinaCloud and a check in this monorepo.
- `@tinacms/bridge` and `@tinacms/astro` are the only packages that can release
  source files for one framework, for example `.astro` files. The other v4
  packages compile to standard ESM in `dist/`.
- `create-tina-app` must not depend on a `@tinacms/*` workspace package. It must
  install correctly into an empty directory.

## Ownership

The TinaCMS core team (`@tinacms/tinacms` on GitHub) owns all the v4 packages in
the tables above. The integration packages that move go to repositories that
TinaCMS owns. Thus the owner of each package agrees with the CODEOWNERS file and
with the publish rules.

---

## Deprecation paths and migration paths

[`DEPRECATIONS.md`](./DEPRECATIONS.md) gives the packages that become deprecated
and the packages that the team removes.
[`INTEGRATIONS.md`](./INTEGRATIONS.md) gives the provider packages and the
integration packages that move to their own repositories.

A package with the status **deprecated** stays available on npm. It continues to
get security fixes during the v3 support period. It does not get new features,
and v4 does not release it.

A package with the status **removed** loses its source code from this monorepo.
Two conditions apply first. The v4 runtime must not refer to the package, and
the migration instructions must be available.

A package with the status **moved** keeps its current npm name. Thus the
installations that exist continue to operate. Its primary repository changes.
The team archives the copy in the monorepo after the new repository makes its
first release.
