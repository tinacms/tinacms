# Astro Kitchen-Sink

Astro 5 + React 18 static site with TinaCMS visual editing, block-based pages, rich-text content, and multi-collection schemas. Ships **zero client-side JavaScript in production** — React only hydrates inside the TinaCMS editor iframe via a custom `client:tina` directive.

## Architecture

Three-layer component model:

1. **Astro pages** (`src/pages/*.astro`) — file-based routing, data fetching via the generated Tina client in frontmatter, static generation with `getStaticPaths()`.
2. **React page wrappers** (`src/components/tina/*.tsx`) — accept `data`/`query`/`variables` props and call `useTina()` for live editing. Used with `client:tina`.
3. **React rendering components** (`src/components/blocks/`, `src/components/layout/`, `src/components/ui/`) — pure rendering for blocks, layout chrome, and UI atoms.
4. **Markdown components** (`src/components/markdown-components.tsx`) — the four custom `TinaMarkdown` renderers documented in [examples/AGENTS.md](../../AGENTS.md).

## Coding Standards

Repo-wide Biome + strict TypeScript apply (see root [AGENTS.md](../../../AGENTS.md)). Shared TinaCMS patterns (including block dispatcher, `useTina()`/`tinaField()`, Tailwind theme, image sanitisation, admin UI selectors) are documented in [examples/AGENTS.md](../../AGENTS.md). App-specific deltas:

- Format with `npx @biomejs/biome format --write <file>` after edits.
- In `.astro` templates, use `class` on native HTML elements (not `className` — that's React-only).
- Do NOT add `key=` props in `.astro` `.map()` calls — `key` is a React concept and renders as a meaningless HTML attribute in Astro. Only needed inside `.tsx` React components.
- `className` on React component tags (e.g. `<Section className="...">`) is correct — those are React props.
- All files under `src/components/` remain `.tsx` — they run inside React islands or are imported by other React components. Only `src/pages/*.astro` and `src/layouts/*.astro` are Astro files.

Collection schemas live in [tina/collections/](tina/collections/).

## Common Commands

- `pnpm dev` — `tinacms dev -c "astro dev"` (TinaCMS wraps Astro)
- `pnpm build` — `tinacms build && astro build`
- `pnpm build:local` — `tinacms build --local --skip-cloud-checks -c "astro build"` (no cloud connection)
- `pnpm dev:astro` / `pnpm build:astro` — Astro-only, skip TinaCMS
- `pnpm test:e2e` / `pnpm test:e2e:ui` — Playwright

## Key Patterns

### `client:tina` directive

Custom Astro client directive that only hydrates React inside the TinaCMS editor iframe — zero JS shipped in production. Defined in `astro-tina-directive/` (`register.js`, `tina.js`, `index.d.ts`).

Use `client:tina` for components that call `useTina()`; they must only hydrate inside the editor iframe. Use `client:load` for interactive components that need JS but aren't Tina-connected (e.g. the mobile nav drawer).

### Astro-specific wrapper around `useTina()`

React page wrappers live in `src/components/tina/` and import from `tinacms/dist/react`. They're loaded with `client:tina` so they only run inside the editor. Outside the editor, static HTML is served. See [examples/AGENTS.md](../../AGENTS.md) for the canonical hook shape and `tinaField()` usage.

### Layout context via props

Global data (header, footer, theme) is fetched server-side in `Layout.astro` and passed as props to React components. This avoids client-side context providers and keeps production pages JS-free.

### Schemas

Shared fields in `tina/schemas/shared-fields.ts` (`dateFieldSchemas`, `makeSlugify`, `actionsFieldSchema`, `colorFieldSchema`). Block schemas in `tina/schemas/blocks.ts`, icon schema in `tina/schemas/icon.ts`. Schemas are centralised in `tina/schemas/` to avoid cross-directory imports between `tina/` and `src/`.

### Content directory

Content is served from the shared content root via `localContentPath` in tina config. Do NOT use `src/content/` — that's Astro's built-in Content Collections, which this project does not use. Shared-content contract is documented in [examples/AGENTS.md](../../AGENTS.md).

### Path aliases

- `@/*` maps to `./src/*` (standard Astro convention, configured in `tsconfig.json`).
- Files under `tina/` live outside `src/`, so they cannot use `@/*`. Use relative paths instead (e.g. `../../src/lib/utils` in `tina/fields/color.tsx`).

### Static generation

All pages are statically generated at build time. Dynamic routes use `getStaticPaths()` to enumerate content.

### Data fetching in Astro pages

Import the generated client and call `client.queries.*()` in page frontmatter:

```ts
import client from '../../tina/__generated__/client';
const result = await client.queries.tag({ relativePath: 'react.json' });
```

Two import styles are interchangeable; pick one per file and stay consistent:

- **Static:** `import client from '../../tina/__generated__/client';`
- **Dynamic:** `const client = (await import('../../tina/__generated__/client')).default;` — useful in pages with `getStaticPaths()` where the module needs to be resolved at runtime.

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | `index.astro` | Home page with block-based content |
| `/posts/` | `posts/index.astro` | Post listing with author avatars and dates |
| `/posts/:slug` | `posts/[...urlSegments].astro` | Post detail (supports nested paths like `/posts/my-folder/a-sub-file`) |
| `/blog/` | `blog/index.astro` | Blog listing with hero images and card grid |
| `/blog/:filename` | `blog/[filename].astro` | Blog detail with hero, author, dates, rich-text body |
| `/authors/` | `authors/index.astro` | Author listing with avatars, descriptions, hobby badges |
| `/authors/:filename` | `authors/[filename].astro` | Author detail with gradient title, hobbies |
| `/:slug` | `[...urlSegments].astro` | Catch-all for page collection (e.g. `/projects-built-with-tina`) |
| `/admin/` | `public/admin/index.html` | TinaCMS admin panel (generated at build) |

## Gotchas

- **Rollup warning:** TinaCMS generated files trigger `UNUSED_EXTERNAL_IMPORT` in Vite/Rollup. Suppressed in `astro.config.mjs` with an `onwarn` handler (upstream: tinacms/tinacms#6386).
- **`react-icons` SSR:** `react-icons` uses directory imports that Node ESM doesn't support. Fixed with `vite.ssr.noExternal: ['react-icons']` in `astro.config.mjs` so Vite bundles it during SSR.
- **CodeQL false positive on `sanitizeImageSrc`:** GitHub CodeQL flags `<img src={avatarSrc}>` as "Client-side cross-site scripting" even when the value is already sanitised. This is a false positive — data is CMS-controlled, already sanitised, and it's an `<img>` not a redirect.

## E2E Tests

Playwright suite in [e2e/](e2e/). App-specific structure:

- `e2e/*.spec.ts` — Frontend tests (pages, navigation, edge cases). Fully parallel, no auth.
- `e2e/admin/*.spec.ts` — Admin panel tests (author, blog, post, page CRUD). Serial within each collection, parallel across collections.
- `e2e/fixtures/` — `api-context.ts` (GraphQL API client), `test-content.ts` (`contentCleanup` fixture).
- `e2e/utils/` — `admin-helpers.ts`, `create-document.ts`, `delete-document.ts`.

## Reference

- Astro starter reference: `tinacms/tina-astro-starter` on GitHub (directive setup, config structure, Vite workarounds).
