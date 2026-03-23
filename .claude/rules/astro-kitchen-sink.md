---
paths:
  - examples/astro/kitchen-sink/**
---

# Astro Kitchen-Sink Baseline

This example recreates `examples/next/kitchen-sink` using Astro 5 with React 18, mirroring identical TinaCMS functionality.

## Architecture

Three-layer component model:
1. **Astro pages** (`src/pages/*.astro`) — routing, data fetching via Tina client, static generation with `getStaticPaths()`
2. **React page wrappers** (`src/components/tina/*.tsx`) — accept `data`/`query`/`variables` props, call `useTina()` for live editing. Used with `client:tina` directive.
3. **React rendering components** (`src/components/blocks/`, `src/components/layout/`, `src/components/ui/`) — pure rendering, mostly copied from Next.js

## Key Patterns

- **`client:tina` directive:** Only hydrates React components inside TinaCMS visual editor iframe. Zero JS in production. Defined in `astro-tina-directive/` (3 files: `register.js`, `tina.js`, `index.d.ts`).
- **Schemas:** Block schemas extracted to `tina/schemas/blocks.ts`, shared fields in `tina/schemas/shared-fields.ts`, icon schema in `tina/schemas/icon.ts`. This differs from Next.js where schemas are co-located with components — extracting avoids messy cross-directory imports between `tina/` and `src/`.
- **Content directory:** Uses `content/` at project root (TinaCMS managed). Do NOT use `src/content/` — that's Astro's built-in Content Collections, which we don't use.
- **Path alias:** `@/*` maps to `./src/*` (Astro convention). This differs from Next.js where `@/*` maps to `./*`. Configured in `tsconfig.json`.

## Next.js → Astro Replacements

| Next.js | Astro |
|---------|-------|
| `next/image` | `<img>` tag |
| `next/link` | `<a>` tag |
| `usePathname()` | `Astro.url.pathname` passed as prop |
| `generateStaticParams()` | `getStaticPaths()` |
| `'use client'` | `client:tina` directive on component tag |
| `next/font/google` | Google Fonts `<link>` in Layout.astro |

## Build & Dev

- **Dev:** `pnpm dev` → `tinacms dev -c "astro dev"` (TinaCMS wraps Astro)
- **Build:** `pnpm build` → `tinacms build && astro build`
- **Build local:** `pnpm build:local` → `tinacms build --local --skip-cloud-checks -c "astro build"` (no cloud connection)
- **Astro-only (no TinaCMS):** `pnpm dev:astro` / `pnpm build:astro`

## Data Fetching

Import the generated client and call `client.queries.*()` in Astro page frontmatter:
```ts
import client from '../../tina/__generated__/client';
const result = await client.queries.tag({ relativePath: 'react.json' });
```

## Gotchas

- **Rollup warning:** TinaCMS generated files trigger `UNUSED_EXTERNAL_IMPORT` in Vite/Rollup. Suppressed in `astro.config.mjs` with `onwarn` handler (upstream: tinacms/tinacms#6386).
- **`client:tina` vs `client:load`:** Use `client:tina` for components that call `useTina()` — they must only hydrate inside the editor iframe. Use `client:load` for interactive components that need JS but aren't Tina-connected (e.g., mobile nav drawer).

## Reference

- **Primary source:** `examples/next/kitchen-sink/` — source of truth for content, schemas, and component behavior
- **Astro patterns:** `tinacms/tina-astro-starter` on GitHub — confirms directive setup, config structure, Vite workarounds
