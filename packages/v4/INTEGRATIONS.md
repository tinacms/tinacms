# v4 integration packages — repository moves

The packages on this list ship as separate npm packages today, inside this
monorepo, and are scoped to a single host framework (Next.js in most cases).

For v4 they move to their own TinaCMS-owned repos so they can:

- evolve on a release cadence independent of the core monorepo,
- support more than one host framework (drop the `next-` framing where the
  capability isn't actually Next-specific),
- have their own CODEOWNERS, issue queue, and changelog.

The current npm names continue to exist. Repository ownership and the
source-of-truth branch change; consumers don't have to re-install on day one.

## Move table

| Current package | Current path | New repo (TinaCMS-owned) | v4 npm name (planned) | Framework note |
|---|---|---|---|---|
| `next-tinacms-cloudinary` | `packages/next-tinacms-cloudinary` | `github.com/tinacms/tinacms-cloudinary` | `@tinacms/cloudinary` | Drop the `next-` prefix; new package exposes a framework-neutral media store plus Next/Express/Astro adapter entries. |
| `next-tinacms-s3` | `packages/next-tinacms-s3` | `github.com/tinacms/tinacms-s3` | `@tinacms/s3` | Framework-neutral media store; Next route handler becomes one adapter alongside Express/Astro/Hono. |
| `next-tinacms-dos` | `packages/next-tinacms-dos` | `github.com/tinacms/tinacms-dos` | `@tinacms/digitalocean-spaces` | Same shape as the S3 move; DO Spaces sits on the S3 client so the framework-neutral core is shared with `@tinacms/s3` where practical. |
| `next-tinacms-azure` | `packages/next-tinacms-azure` | `github.com/tinacms/tinacms-azure` | `@tinacms/azure-blob` | Framework-neutral media store on top of `@azure/storage-blob`. |
| `tinacms-clerk` | `packages/tinacms-clerk` | `github.com/tinacms/tinacms-clerk` | `@tinacms/clerk` | Auth integration; gains adapter entries for non-Next frameworks (Express + Hono first, Astro alongside). |
| `tinacms-authjs` *(formerly `tinacms-next-auth`)* | `packages/tinacms-authjs` | `github.com/tinacms/tinacms-authjs` | `@tinacms/authjs` | Auth.js integration; the Next-specific glue becomes one of several framework adapters. |
| `tinacms-gitprovider-github` | `packages/tinacms-gitprovider-github` | `github.com/tinacms/tinacms-gitprovider-github` | `@tinacms/gitprovider-github` | Converted to a v4 plugin (server-segment + client-segment via the full-stack plugin model — see ADR-007 in the v4 spec). |

## What "moved" means in practice

For each row above:

1. **Repo is created** with the existing source copied over, CODEOWNERS
   pointing at the TinaCMS core team, and the changesets / GitHub Actions
   wired to publish to npm.
2. **First independent release** ships under the v4 npm name (`@tinacms/*`)
   with a framework-neutral core plus adapter entries (`/next`, `/express`,
   `/astro`, `/hono`) following the same convention as
   `@tinacms/tinacms`'s exports map.
3. **In-monorepo source** is marked deprecated (npm `deprecated` field
   pointing at the new package) and frozen — no new features, only critical
   security fixes during the v3 support window.
4. **Documentation** in the TinaCMS docs site swaps the install command and
   import paths for the new package. The old install command continues to
   work for v3 consumers.

## Framework-neutral core convention

Each new repo follows the same internal layout so a reviewer can move
between them without re-learning the structure:

```
@tinacms/<name>/
├── src/
│   ├── index.ts            # universal entry — config types + framework-neutral client
│   ├── server/             # server primitives (request handler factory, signed-URL helpers, …)
│   └── adapters/
│       ├── next/index.ts   # Next route handler / App-Router handlers
│       ├── express/index.ts
│       ├── astro/index.ts
│       └── hono/index.ts
└── package.json            # exports map with one entry per adapter
```

The Next.js code that lives at the top of the current `next-tinacms-*`
packages moves into `src/adapters/next/`. The reusable bits (credential
loading, signing, request validation) move into `src/` and `src/server/`.

## What is **not** moving

- `mongodb-level`, `sqlite-level`, `upstash-redis-level` — already in their
  own repos.
- `create-tina-app` — stays in this monorepo (see
  [`README.md`](./README.md)).
- Any `@tinacms/*` package listed in the retained v4 surface in
  [`README.md`](./README.md).
