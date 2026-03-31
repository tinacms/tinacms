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

## Content

Content is shared across all kitchen-sink examples from `examples/shared/`:

- **TinaCMS admin:** Reads shared content via `localContentPath: '../../../shared'` in `tina/config.tsx`
- **Hugo rendering:** Accesses shared content via `[[module.mounts]]` in `hugo.toml` (for `.md`/`.json` collections) or local `.md` copies (for `.mdx` collections that Hugo can't process directly)
- **Static assets:** `static/uploads` and `static/blocks` are symlinked to `examples/shared/public/`
