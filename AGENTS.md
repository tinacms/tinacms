# TinaCMS Monorepo

## Project Overview

TinaCMS is an open-source headless CMS with visual editing. This monorepo contains the core packages, CLI, admin app, and framework example apps.

## Monorepo Structure

```
packages/              # Core packages (tinacms, tinacms-authjs, create-tina-app, etc.)
packages/@tinacms/     # Scoped packages (cli, app, datalayer, graphql, mdx, scripts, etc.)
examples/              # Framework example apps
  next/kitchen-sink/   # Next.js 15 — the reference kitchen-sink implementation
  next/tina-self-hosted-demo/ # Self-hosted with auth
  astro/kitchen-sink/  # Astro 5 — mirrors Next.js kitchen-sink
  hugo/kitchen-sink/   # Hugo kitchen-sink
  react/kitchen-sink/  # React kitchen-sink
  shared/              # Shared content and public assets across kitchen-sink examples
experimental-examples/ # Experimental/prototype examples
playwright/            # Playwright test infrastructure
scripts/               # Repo maintenance scripts
tests/                 # Build verification tests
```

## Build & Dev Commands

- **Install:** `pnpm install` (from repo root)
- **Build core packages:** `pnpm build` (runs `turbo run build --filter="./packages/**"`)
- **Watch mode:** `pnpm dev` (builds then watches via `@tinacms/scripts`)
- **Test:** `pnpm test` (runs `turbo run test --filter="./packages/**"`)
- **Example apps:** Each has its own `dev`, `build`, `build:local` scripts — check the example's `package.json`

## Workspace Configuration

- `pnpm-workspace.yaml` defines workspace packages and a `catalog:` section for shared dependency versions
- Example apps use `workspace:*` to reference local TinaCMS packages
- `turbo.json` defines build/test/types task dependencies

## Coding Standards

- **Linting/Formatting:** Biome (`biome.json` at root). Example apps extend with `"extends": ["../../../biome.json"]`
- **TypeScript:** Base config at `base.tsconfig.json`. Examples extend it. Strict mode enabled.
- **Package manager:** pnpm only. Never use npm or yarn.

## Kitchen-Sink Examples

All kitchen-sink examples implement the **same content model** to demonstrate identical functionality across frameworks. `examples/next/kitchen-sink/` is the reference implementation.

### Unified Content Schema

| Collection | Format | Content Path | Collection File |
|------------|--------|-------------|-----------------|
| Tag | JSON | `content/tags/` | `tina/collections/tag.ts` |
| Author | MD | `content/authors/` | `tina/collections/author.tsx` |
| Post | MDX | `content/posts/` | `tina/collections/post.tsx` |
| Blog | MDX | `content/blogs/` | `tina/collections/blog.tsx` |
| Page | MDX | `content/pages/` | `tina/collections/page.tsx` |
| Global | JSON | `content/global/` | `tina/collections/global.ts` |

Note: `.tsx` collection files contain JSX for custom field components (e.g., ColorPickerInput in `global.ts` theme field). `.ts` files are pure schema definitions. This applies across all kitchen-sink examples.

### Shared Patterns Across Kitchen-Sink Apps

- TinaCMS wraps the framework dev server: `tinacms dev -c "<framework dev>"`
- Build order: `tinacms build && <framework build>`
- Content lives in `content/` with identical MDX/JSON files across examples
- Tina config at `tina/config.tsx` with collections in `tina/collections/`
- Admin UI output to `public/admin/`
- Media root: `uploads/` within `public/`

### Standardized Stack

| Tool | Choice |
|------|--------|
| Package Manager | pnpm (workspace-native) |
| Linting/Formatting | Biome (extends root config) |
| Styling | Tailwind CSS 4 (CSS-first config) |
| TypeScript | 5.7+ strict (extends `base.tsconfig.json`) |
