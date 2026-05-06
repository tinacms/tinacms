# TinaCMS Self-Hosted Demo

Next.js 14 Pages Router app that runs TinaCMS **without TinaCloud** — backend served from Next.js API routes, content stored in MongoDB (prod) or filesystem (dev), auth via `tinacms-authjs` + `next-auth`, optional GitHub-backed version control.

This app is a reference implementation for the self-hosted backend. It does not share content with the other kitchen-sink apps — it keeps its own `content/` directory so the auth + database wiring can be demonstrated end-to-end.

## Architecture

- **Pages Router** — routes under `pages/`. The self-hosted GraphQL endpoint lives at `pages/api/tina/[...routes].ts` and is handled by `TinaNodeBackend`.
- **Dual-mode auth** — at runtime, `TINA_PUBLIC_IS_LOCAL=true` switches to `LocalAuthProvider` (no credentials required — dev/demo only). When unset, `UsernamePasswordAuthJSProvider` from `tinacms-authjs` runs behind `next-auth`.
- **Dual-mode database** — [tina/database.ts](tina/database.ts) returns `createLocalDatabase()` (filesystem level DB) in local mode, or `createDatabase()` backed by `MongodbLevel` (`MONGODB_URI`, db `tinacms`, collection `tinacms`) in prod. GitHub integration is wired in via `tinacms-gitprovider-github` when env vars are set.
- **Admin UI** — built by `tinacms build` to `public/admin/`, rewritten to `/admin`.

## Coding Standards

Repo-wide Biome + TypeScript apply (see root [AGENTS.md](../../../AGENTS.md)). Deltas:

- [next.config.js](next.config.js) ignores ESLint and TypeScript errors during build. Treat that as a **demo-only** setting — don't copy into production apps.
- [pages/_app.tsx](pages/_app.tsx) uses a client-only render guard (component returns null until after mount) to avoid SSR/CSR hydration mismatches with the TinaCMS provider.

## Common Commands

- `pnpm dev` — `TINA_PUBLIC_IS_LOCAL=true`, starts local-auth dev mode.
- `pnpm dev:prod` — dev against the production auth/DB setup (rebuilds backend).
- `pnpm build` — `tinacms build && next build`.
- `pnpm start` — `tinacms build && next start`.
- `pnpm export` — static export.
- `pnpm lint` / `pnpm format` — Biome.

## Key Patterns

### Backend API route

[pages/api/tina/[...routes].ts](pages/api/tina/[...routes].ts) wires `TinaNodeBackend`:

```ts
const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true';
const handler = TinaNodeBackend({
  authProvider: isLocal
    ? LocalBackendAuthProvider()
    : AuthJsBackendAuthProvider({ authOptions: TinaAuthJSOptions({ databaseClient, secret: process.env.NEXTAUTH_SECRET }) }),
  databaseClient,
});
```

All GraphQL queries, mutations, and auth flows go through this single catch-all route.

### Database adapter selection

[tina/database.ts](tina/database.ts):

```ts
export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: new GitHubProvider({ ... }),
      databaseAdapter: new MongodbLevel({ mongoUri, collectionName: 'tinacms', dbName: 'tinacms' }),
      namespace: process.env.GITHUB_BRANCH ?? 'main',
    });
```

### Auth data

User records live in [content/users/index.json](content/users/index.json) — TinaCMS treats users as a managed collection (`TinaUserCollection` from `tinacms-authjs`). The seeded user `tinauser` / `tinarocks` has `passwordChangeRequired: true` so first login forces a rotation.

### Config

[tina/config.tsx](tina/config.tsx) sets `contentApiUrlOverride: '/api/tina/gql'` to point the admin UI at the local backend instead of TinaCloud. Collections declared: `post` (mdx), `author` (md), `page` (md, blocks-based), `global` (json). The demo does **not** include Blog, Tag, or the shared schema — content lives in `content/` alongside the code.

### Media

Local media driver uploads to `public/uploads/`. A commented Cloudinary `loadCustomStore` block in `tina/config.tsx` shows the alternative path — switch by uncommenting and setting the Cloudinary env vars.

## Environment Variables

From [.env.example](.env.example):

| Var | Purpose |
|-----|---------|
| `MONGODB_URI` | MongoDB connection string (prod DB) |
| `GITHUB_OWNER` / `GITHUB_REPO` / `GITHUB_BRANCH` / `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub version-control integration |
| `TINA_PUBLIC_IS_LOCAL` | `true` → `LocalAuthProvider` + filesystem DB |
| `NEXTAUTH_SECRET` | next-auth session signing secret |
| `NEXT_PUBLIC_TINA_CLIENT_ID` / `TINA_TOKEN` | Referenced for parity but unused when self-hosted |

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Home (rewrites to `/home`) |
| `/[filename]` | Dynamic page rendering (`home`, `about`) |
| `/posts` | Post listing |
| `/posts/[filename]` | Post detail |
| `/api/tina/[...routes]` | TinaCMS GraphQL + auth backend |
| `/admin` | Admin UI (static, rewrites to `/admin/index.html`) |
| `/404` | Not-found page |

No explicit `/auth/*` signin pages — `next-auth` handles sessions implicitly via the `TinaNodeBackend` request handler.

## Gotchas

- `next.config.js` silences build-time type and lint errors. Any real app should turn that off.
- No E2E tests ship with this demo.
- Content is **not shared** with the kitchen-sink apps — edits here don't affect `examples/shared/`.
- No `vercel.json` / Dockerfile. Deployment is standard Node; for Vercel/Netlify the branch is read from `VERCEL_GIT_COMMIT_REF` / `HEAD` env vars in `tina/database.ts`.
- Switching to production mode requires `MONGODB_URI` **and** re-running `tinacms build` (via `pnpm dev:prod`) so the admin bundle picks up the updated backend.

## Reference

- TinaCMS self-hosted docs: [tina.io/docs/self-hosted/overview](https://tina.io/docs/self-hosted/overview)
- `tinacms-authjs`: [github.com/tinacms/tinacms/tree/main/packages/tinacms-authjs](https://github.com/tinacms/tinacms/tree/main/packages/tinacms-authjs)
