# TinaCMS Astro Kitchen Sink

The Astro version of the TinaCMS kitchen-sink example app. Demonstrates all core TinaCMS features — visual editing, block-based pages, rich-text content, and multi-collection schemas — built with Astro 5 and zero client-side JS in production.

## Prerequisites

- Node.js 18+
- pnpm

## Development

This example lives in the TinaCMS monorepo. From the repo root:

```bash
pnpm install
cd examples/astro/kitchen-sink
pnpm dev          # Astro + TinaCMS (visual editing at /admin/)
pnpm dev:astro    # Astro only (no TinaCMS)
```

The site will be available at `http://localhost:4321/`.

## Building

```bash
pnpm build        # Full build (TinaCMS + Astro)
pnpm build:local  # Build without cloud connection (local content only)
pnpm preview      # Preview the built site
```

## Available Routes

| Route | Description |
|-------|-------------|
| `/` | Home page (block-based: hero, features, CTA, testimonial, content) |
| `/posts/` | Post listing with author avatars and dates |
| `/posts/:slug` | Post detail (supports nested paths) |
| `/blog/` | Blog listing with hero images and card grid |
| `/blog/:filename` | Blog detail with rich-text body |
| `/authors/` | Author listing with hobby badges |
| `/authors/:filename` | Author detail with gradient title |
| `/projects-built-with-tina` | Static page (block-based) |
| `/admin/` | TinaCMS admin panel |

## Collections

6 TinaCMS collections:
- **Tag** — categorisation labels for posts
- **Author** — contributor profiles with avatar, bio, and hobbies
- **Global** — site-wide config (header nav, footer social links, theme)
- **Post** — MDX articles with rich-text excerpts, author references, and tag support
- **Blog** — MDX blog entries with hero images and publish dates
- **Page** — block-based pages (hero, features, CTA, testimonial, content)

## Features

- **Zero-JS production pages** — custom `client:tina` directive only hydrates React inside the TinaCMS editor iframe
- **Block-based pages** — 5 block types (hero, features, CTA, testimonial, content) with visual block selector
- **Visual editing** — click-to-edit via `tinaField()` targeting, live preview via `useTina()`
- **Rich-text content** — TinaMarkdown with custom components (code blocks, blockquotes, datetime, newsletter signup)
- **Static generation** — all pages statically generated at build time
- **Tailwind CSS** — full dark mode support with theme color customisation
- **Global site config** — header navigation, footer social links, and theme settings managed via TinaCMS

## Visual Editing

Run `pnpm dev` and open TinaCMS at `http://localhost:4321/admin/`. All 6 collections are listed in the sidebar and fully editable. For pages, posts, and blogs, TinaCMS provides inline visual editing — the page renders in a preview iframe where clicking any editable field opens it for editing directly in context. Fields are marked as editable using `tinaField()`, and changes appear in real time via `useTina()`. The custom `client:tina` directive ensures components only hydrate inside TinaCMS's editor iframe, so production pages ship zero JavaScript.