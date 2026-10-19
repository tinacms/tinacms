# TinaCMS SvelteKit kitchen-sink

A SvelteKit 3 + Svelte 5 site with TinaCMS visual editing, built on
[`@tinacms/sveltekit`](../../../packages/@tinacms/sveltekit/README.md). It
implements the same content model as the other kitchen-sink examples (Next.js
is the reference) and reads the shared content in `examples/shared/`.

- How to deploy to GitHub Pages: [DEPLOY.md](./DEPLOY.md)
- Why it's built this way (decisions, known issues, checklist for new
  routes): [DESIGN.md](./DESIGN.md)

## Run it

This example uses workspace packages, so clone the whole monorepo.

```sh
# from the monorepo root
pnpm install
pnpm build            # builds the TinaCMS packages

cd examples/sveltekit/kitchen-sink
pnpm dev
```

- Site: <http://localhost:5173>
- Tina admin: <http://localhost:5173/admin/index.html>

Open a page from the admin, click any text to select its field, and edit it.
The preview updates as you type, before you save.

## Scripts

| Command | Output | Use it for |
|---|---|---|
| `pnpm dev` | Vite dev server + local Tina | Editing content with visual editing |
| `pnpm build` | `build/` (`adapter-node`) | A Node server: prerendered pages plus the live-edit endpoint |
| `pnpm preview` | Serves `build/` with `vite preview` | Trying the Node build locally, including live editing |
| `pnpm start` | Runs `build/` with Node | Production. Behind HTTPS, or set `PROTOCOL_HEADER` (see below) |
| `pnpm build:static` | `build-static/` (`adapter-static`) | Static hosting: public pages only, no admin, no live editing |
| `pnpm build:pages` | `build-static/` + `admin/` | GitHub Pages with TinaCloud. See [DEPLOY.md](DEPLOY.md) |
| `pnpm preview:static` | Serves `build-static/` | Trying the static build locally |
| `pnpm check` | — | Type-checking with `svelte-check` |

The build scripts run `vite build` *through* `tinacms build -c` so Tina's local
GraphQL server stays up while SvelteKit prerenders. `TINA_PUBLIC_IS_LOCAL=true`
selects the local client; `TINA_STATIC_BUILD=true` selects `adapter-static`.

## Routes

| URL | Content | Files |
|---|---|---|
| `/` | `pages/home.md` (blocks) | `src/routes/+page.*` |
| `/<page>` | Other page documents | `src/routes/[...urlSegments]/` |
| `/posts`, `/posts/<a/b/c>` | Posts, including nested folders | `src/routes/posts/` (`[...slug]`) |
| `/blog`, `/blog/<slug>` | Blog posts | `src/routes/blog/` |
| `/authors`, `/authors/<slug>` | Authors | `src/routes/authors/` |
| Any unknown URL | 404 page | `src/routes/+error.svelte` |
| `POST /tina-island/<name>` | Live-edit endpoint for prerendered pages | `src/routes/tina-island/[name]/+server.ts` |

Global settings (header, footer, theme) load in `src/routes/+layout.server.ts`.
Every route is prerendered (`+layout.ts`); dynamic routes list their pages in
`entries()`.

## Project layout

```
tina/
  config.ts             Tina config (content path, media, collections)
  collections/          Post, Blog, Author, Page, Global, Tag schemas
  __generated__/        Generated client and types (don't edit)
src/
  hooks.server.ts       sequence(tinaHandle)
  routes/               See the routes table
  lib/
    styles/theme.css    Design tokens as CSS custom properties
    utils.ts            URL sanitizers, date formatting
    components/
      layout/           Header, Footer, Container, Section, Icon, Actions
      blocks/           Hero, Features, CTA, Testimonial, Content, Blocks
      tina/             PageRenderer, PostDetail, BlogDetail, AuthorDetail
      markdown/         Custom rich-text components (see below)
      ui/               GradientTitle, Badge, Card, NoData
static/
  uploads -> ../../../shared/public/uploads   (symlink)
  blocks  -> ../../../shared/public/blocks    (symlink)
```

## How things are wired

**Shared content and media.** `tina/config.ts` sets `localContentPath` to
`examples/shared`. SvelteKit serves assets from `static/` rather than
`public/`, so media is configured with `publicFolder: "static"` and
`mediaRoot: "uploads"`, and `static/uploads` and `static/blocks` are symlinks
into `examples/shared/public/`.

**Imports.** Internal imports use package subpath imports defined in
`package.json` (`#lib/*`, `#tina/*`, `#content/*`) instead of `$lib`.

**Nested documents.** Posts can live in subfolders, so the route is
`[...slug]` and links are built from `_sys.breadcrumbs.join('/')`.
`_sys.filename` alone would drop the folders.

**Editable fields.** Each page reads live data with `useTina(() => query)` and marks
elements with `data-tina-field={tinaField(doc, 'field')}`. The
`PageRenderer`/`*Detail` components in `src/lib/components/tina/` show the
pattern.

**Custom rich-text components.** MDX components and shortcodes are mapped in
`src/lib/components/markdown/index.ts` and passed to
`<TinaMarkdown components={customComponents} />`:

| Template | Component | Syntax |
|---|---|---|
| `DateTime` | `DateTime.svelte` | MDX `<DateTime />` |
| `BlockQuote` | `BlockQuote.svelte` | MDX |
| `pullQuote` | `PullQuote.svelte` | Shortcode `{{% pull-quote %}}` (needs a `match` in `post.tsx`) |
| `NewsletterSignup` | `NewsletterSignup.svelte` | MDX |

**Styling.** Plain CSS, no Tailwind: tokens live in `theme.css`,
`<html data-theme="blue|teal|green|red">` switches the palette, and each
component has a scoped `<style>` block.

## Checking it

1. Run `pnpm dev`, open `/posts/large-file` from the admin, click the title
   and body, and type without saving. The preview should follow along.
2. Open the same URL outside the admin. The HTML should contain no
   `data-tina-form` and should not load `/admin/bridge.js`.
3. After `pnpm build:static`: `build-static/index.html` exists and
   `build-static/admin/` does not.
4. After `pnpm build && pnpm preview`: in the admin, the preview POSTs to
   `/tina-island/post?slug=…`, gets 200, and updates as you edit.

**`pnpm start` over plain HTTP.** adapter-node 6 assumes `https` unless
`PROTOCOL_HEADER` names a header your proxy sets (e.g. `x-forwarded-proto`).
Over plain `http://localhost` the island endpoint then sees a different origin
than the browser sends and answers 403, so live editing fails. Use
`pnpm preview` locally; in production, serve over HTTPS or set
`PROTOCOL_HEADER`.

`pnpm check` also lists errors from `tina/__generated__/` and the core
`tinacms` sources. Those come from the tsconfig scope, not this app's code.
