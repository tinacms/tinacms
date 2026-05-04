# React Kitchen-Sink

Vite 6 + React 18 client-side SPA with TinaCMS visual editing, block-based pages, rich-text content, and multi-collection schemas. Runtime Tina client queries (no static generation).

## Architecture

- **Entry point** — `index.html` loads `src/main.tsx`, which mounts React and wraps the app in `<BrowserRouter>`.
- **Routing** — React Router DOM v6 in [src/App.tsx](src/App.tsx). All page components are lazy-loaded via `React.lazy()` inside a `<Suspense fallback={<Loading />}>`.
- **Data fetching** — every page calls the generated Tina client at runtime via the `useTinaQuery` hook, which returns `{ data, query, variables, loading, error }`. Results feed straight into `useTina()` in the render path.
- **Admin UI** — `tinacms build` writes the admin bundle to `public/admin/`. A client-side route `/admin` redirects to `/admin/index.html`.

## Coding Standards

Repo-wide Biome + strict TypeScript apply (see root [AGENTS.md](../../../AGENTS.md)). Shared TinaCMS patterns (block dispatcher, `useTina()`/`tinaField()`, Tailwind theme, image sanitisation, admin UI selectors, slugify, GraphQL quirks) live in [examples/AGENTS.md](../../AGENTS.md). App-specific deltas:

- Path alias `@/*` resolves to the project root (not `./src`). Configured in both [vite.config.ts](vite.config.ts) and [tsconfig.json](tsconfig.json). Import like `@/src/hooks/use-tina-query`, `@/tina/__generated__/client`.
- A thin re-export at [lib/utils.ts](lib/utils.ts) mirrors `src/lib/utils.ts` so `tina/config.tsx` can import `../lib/utils` without reaching into `src/`.
- Collection schemas live in [tina/collections/](tina/collections/). The `@ts-ignore` pragmas in `post.tsx`, `author.tsx`, and `global.ts` work around incomplete TinaCMS types for custom field UI components — keep them.

## Common Commands

- `pnpm dev` — `MONOREPO_DEV=true tinacms dev -c "vite"` (Vite dev + TinaCMS)
- `pnpm build` — `tinacms build && vite build`
- `pnpm preview` — Vite preview of the production build
- `pnpm lint` / `pnpm format` — Biome
- `pnpm e2e` / `pnpm e2e:ui` — Playwright

## Key Patterns

### `useTinaQuery` hook

[src/hooks/use-tina-query.ts](src/hooks/use-tina-query.ts) wraps a Tina client call and exposes `{ data, query, variables, loading, error }`. The caller must wrap the query function in `useCallback` with proper deps. A `cancelled` flag prevents state updates on unmounted components.

Typical page flow:

```tsx
const { data, query, variables, loading, error } = useTinaQuery(
  useCallback(() => client.queries.post({ relativePath }), [relativePath])
);
if (loading) return <Loading />;
if (error || !data) return <NoData />;
return <PostView data={data} query={query} variables={variables} />;
```

The render component (`PostView` above) then uses the canonical `useTina()` + `tinaField()` pattern from [examples/AGENTS.md](../../AGENTS.md). See [src/pages/post-detail.tsx](src/pages/post-detail.tsx) and [src/pages/home.tsx](src/pages/home.tsx) for complete examples.

### Block dispatcher specifics

[src/components/blocks/index.tsx](src/components/blocks/index.tsx) switches on `block.__typename` (falling back to `_template`) and lazy-loads the matching component. Unknown blocks render a yellow warning box rather than silently skipping — useful during schema changes. Every block wrapper sets `data-tina-field={tinaField(block)}` so the whole card is selectable in the visual editor.

### SPA data fetching

Everything is fetched on mount — no build-time static generation. List pages call connection queries like `client.queries.postConnection({ first: 1000 })`. This is fine for the demo but implies the full content set is loaded up-front; if forking for production, consider pagination or SSR.

### Theme tokens

Theme tokens (`blue`, `teal`, `green`, `red`, `pink`, `purple`, `orange`, `yellow`) are defined in [styles/global.css](styles/global.css). `prose` variants are configured for `default` / `tint` / `primary` section backgrounds in [tailwind.config.js](tailwind.config.js).

Config lives at [tina/config.tsx](tina/config.tsx); sanitisation helpers at [src/lib/utils.ts](src/lib/utils.ts).

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | `src/pages/home.tsx` | Home — renders `home.md` blocks |
| `/posts` | `src/pages/posts-list.tsx` | Post listing |
| `/posts/*` | `src/pages/post-detail.tsx` | Post detail (breadcrumb path match) |
| `/blog` | `src/pages/blog-list.tsx` | Blog listing |
| `/blog/:filename` | `src/pages/blog-detail.tsx` | Blog detail |
| `/authors` | `src/pages/authors-list.tsx` | Author listing |
| `/authors/:filename` | `src/pages/author-detail.tsx` | Author detail |
| `/admin` | redirect → `/admin/index.html` | TinaCMS admin panel |
| `/404` | `src/pages/not-found.tsx` | Not found |
| `/*` | `src/pages/dynamic-page.tsx` | Catch-all for block-based pages |

## E2E Tests

Playwright suite in [e2e/](e2e/). App-specific:

- `e2e/*.spec.ts` — `home`, `posts`, `blog`, `authors`, `navigation`, `edge-cases`.
- Card elements expose `data-testid="post-card-${filename}"` for stable selection.
- [playwright.config.ts](playwright.config.ts): `timeout: 60s`, `expect.timeout: 30s`, `baseURL: http://localhost:3000`, Chromium-only, CI retries 2 / local 0, webServer auto-starts the dev server (cross-platform — Windows uses `set`, Unix uses `export`).

## Gotchas

- **Cancel token in `useTinaQuery`** — the hook uses a `cancelled` flag in cleanup to avoid setting state after unmount. If you copy the pattern elsewhere, keep the flag.
- **No SSR** — search engines see an empty shell. The kitchen-sink is a demo of TinaCMS + Vite + React; adding SSR (e.g. via `vike`) is out of scope.
- **Admin redirect** — `/admin` is a client-side `<Navigate>`; the actual admin HTML is served statically from `public/admin/index.html` by Vite's dev server and by the production preview/build output.

## Reference

- TinaCMS visual editing: [tina.io/docs/contextual-editing/overview](https://tina.io/docs/contextual-editing/overview)
