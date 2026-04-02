# TinaCMS Hugo Kitchen Sink

A Hugo-based example app demonstrating all core TinaCMS features — admin panel editing, block-based pages, rich-text content, and multi-collection schemas.

## Prerequisites

- Node.js (see `.nvmrc` in repo root for version)
- pnpm (via corepack)

## Getting Started

```sh
# From the monorepo root
pnpm install
pnpm build

# Start Hugo dev server with TinaCMS
cd examples/hugo/kitchen-sink
pnpm dev
```

- Site: http://localhost:1313/
- Admin panel: http://localhost:1313/admin/index.html

Hugo Extended is installed automatically via the `hugo-extended` npm package — no system-level Hugo install required.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start TinaCMS + Hugo dev server |
| `pnpm build` | Build TinaCMS + Hugo for production |
| `pnpm build:local` | Build with local TinaCMS (no cloud) |
| `pnpm serve` | Hugo dev server only (no TinaCMS) |
| `pnpm build:hugo` | Hugo build only (no TinaCMS) |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm test:e2e:ui` | Run Playwright tests with UI |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with block-based content (hero, features, CTA, testimonial) |
| `/posts/` | Post listing |
| `/posts/:slug` | Post detail (supports nested paths like `/posts/my-folder/a-sub-file/`) |
| `/blog/` | Blog listing (2-column grid with hero images) |
| `/blog/:filename` | Blog detail |
| `/authors/` | Author listing |
| `/authors/:filename` | Author detail |
| `/pages/:filename` | Block-based pages (e.g., `/pages/projects-built-with-tina/`) |
| `/admin/` | TinaCMS admin panel |

## Content

Content is shared across all kitchen-sink examples from `examples/shared/`:

- **TinaCMS admin:** Reads shared content via `localContentPath: '../../../shared'` in `tina/config.tsx`
- **Hugo rendering:** Accesses shared content via `[[module.mounts]]` in `hugo.toml` — all collections use `.md`/`.json` and are mounted directly
- **Static assets:** `static/uploads` and `static/blocks` are symlinked to `examples/shared/public/`

## Known Differences from Next.js/Astro Versions

| Feature | Next.js/Astro | Hugo |
|---------|---------------|------|
| Visual/inline editing | Click-to-edit via `useTina()` | Admin panel only ([docs](https://tina.io/docs/contextual-editing/overview)) |
| Image optimization | Framework `<Image>` component | Standard `<img>` tags |
| Client-side navigation | SPA-style | Full page reloads |
| Custom rich-text templates | BlockQuote, DateTime, NewsletterSignup | Not supported (Goldmark renders standard markdown) |
