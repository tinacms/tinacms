# v4 integration packages — repository moves

The packages in this file are separate npm packages now, and they are in this
monorepo. Each package operates with one host framework only. For most of them,
that framework is Next.js.

For v4, these packages move to their own repositories that TinaCMS owns. The
move gives them these three abilities:

- They can release on a schedule that is independent of the core monorepo.
- They can support more than one host framework. The `next-` name is not correct
  when the capability is not specific to Next.js.
- They can have their own CODEOWNERS file, issue queue, and changelog.

The npm names do not change. The repository owner and the primary branch change.
A user does not have to install the package again immediately.

## Move table

| Current package | Current path | New repository (TinaCMS owns it) | Planned v4 npm name | Framework note |
|---|---|---|---|---|
| `next-tinacms-cloudinary` | `packages/next-tinacms-cloudinary` | `github.com/tinacms/tinacms-cloudinary` | `@tinacms/cloudinary` | Remove the `next-` prefix. The new package supplies a framework-neutral media store, and adapter entries for Next.js, Express, and Astro. |
| `next-tinacms-s3` | `packages/next-tinacms-s3` | `github.com/tinacms/tinacms-s3` | `@tinacms/s3` | A framework-neutral media store. The Next.js route handler becomes one adapter. Express, Astro, and Hono get their own adapters. |
| `next-tinacms-dos` | `packages/next-tinacms-dos` | `github.com/tinacms/tinacms-dos` | `@tinacms/digitalocean-spaces` | The same shape as the S3 move. DigitalOcean Spaces uses the S3 client. Thus it shares the framework-neutral core with `@tinacms/s3` where possible. |
| `next-tinacms-azure` | `packages/next-tinacms-azure` | `github.com/tinacms/tinacms-azure` | `@tinacms/azure-blob` | A framework-neutral media store on `@azure/storage-blob`. |
| `tinacms-clerk` | `packages/tinacms-clerk` | `github.com/tinacms/tinacms-clerk` | `@tinacms/clerk` | An auth integration. It gets adapter entries for frameworks other than Next.js: Express and Hono first, then Astro. |
| `tinacms-authjs` *(the previous name was `tinacms-next-auth`)* | `packages/tinacms-authjs` | `github.com/tinacms/tinacms-authjs` | `@tinacms/authjs` | An Auth.js integration. The code that is specific to Next.js becomes one framework adapter of a set. |
| `tinacms-gitprovider-github` | `packages/tinacms-gitprovider-github` | `github.com/tinacms/tinacms-gitprovider-github` | `@tinacms/gitprovider-github` | The team changes it to a v4 plugin with a server segment and a client segment. ADR-007 of the v4 specification gives this full-stack plugin model. |

## The move procedure

Do these steps for each row above:

1. Create the repository. Copy the source code into it. Set CODEOWNERS to the
   TinaCMS core team. Configure the changesets and the GitHub Actions that
   release to npm.
2. Make the first independent release with the v4 npm name (`@tinacms/*`). The
   release contains a framework-neutral core, and the adapter entries `/next`,
   `/express`, `/astro`, and `/hono`. Use the same convention as the `exports`
   map of `@tinacms/tinacms`.
3. Make the source code in the monorepo deprecated. Set the npm `deprecated`
   field to point to the new package. Do not add features. Supply only necessary
   security fixes during the v3 support period.
4. Change the TinaCMS documentation site. Replace the installation command and
   the import paths with the new package. The v3 installation command continues
   to operate.

## The convention for a framework-neutral core

Each new repository uses the same internal layout. Thus a reviewer can move
between the repositories and does not learn a new structure.

```
@tinacms/<name>/
├── src/
│   ├── index.ts            # universal entry: config types, framework-neutral client
│   ├── server/             # server primitives: request handler factory, signed-URL helpers
│   └── adapters/
│       ├── next/index.ts   # Next.js route handler, App Router handlers
│       ├── express/index.ts
│       ├── astro/index.ts
│       └── hono/index.ts
└── package.json            # exports map with one entry for each adapter
```

The Next.js code at the top of each current `next-tinacms-*` package moves into
`src/adapters/next/`. The code that all frameworks use moves into `src/` and
`src/server/`. This code loads the credentials, signs the requests, and
validates the requests.

## The packages that do not move

- `mongodb-level`, `sqlite-level`, and `upstash-redis-level`. They are already
  in their own repositories.
- `create-tina-app`. It stays in this monorepo. Refer to
  [`README.md`](./README.md).
- Each `@tinacms/*` package in the list of v4 packages in
  [`README.md`](./README.md).
