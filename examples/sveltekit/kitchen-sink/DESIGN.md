# SvelteKit kitchen-sink — design notes

This document explains **why** the example is built the way it is. The
[README](./README.md) covers running it, and [DEPLOY.md](./DEPLOY.md) covers
GitHub Pages. For how the editing integration itself works (hooks, bridge,
`useTina`), read the package's
[DESIGN.md](../../../packages/@tinacms/sveltekit/DESIGN.md) first: this file
builds on it.

It's written for someone new to the codebase: each decision says what problem
it solves and what it costs.

- [What this example is for](#what-this-example-is-for)
- [How a page gets its content](#how-a-page-gets-its-content)
- [Decisions](#decisions) (EX-01 … EX-14)
- [Known issues and differences from the reference](#known-issues-and-differences-from-the-reference)
- [Checklist for adding a new route](#checklist-for-adding-a-new-route)

## What this example is for

Every kitchen-sink example in `examples/` implements the **same content
model** against the **same content files** (`examples/shared/`), so you can
compare frameworks side by side. The Next.js example is the reference. This
one shows the same thing in SvelteKit 3 and Svelte 5, using
`@tinacms/sveltekit`, and it doubles as the package's test bed: most package
bugs were found here first.

## How a page gets its content

Take `/posts/my-folder/my-folder-b/deeply-nested`:

1. SvelteKit matches `src/routes/posts/[...slug]/` with
   `slug = "my-folder/my-folder-b/deeply-nested"` (EX-04).
2. `+page.server.ts` asks the generated Tina client for
   `posts/<slug>.md` and wraps the result with `requestWithMetadata()`.
   If the post doesn't exist, it returns a 404 (EX-06).
3. The root layout's `+layout.server.ts` does the same for the global
   settings (header, footer, theme).
4. `+page.svelte` passes the query to `PostDetail.svelte`, which calls
   `useTina(() => query)` and marks fields with `tinaField()`.
5. At build time the page is prerendered to HTML (EX-07), using the list of
   pages from `entries()`.

Every Tina-backed route follows that pattern.

## Decisions

Each record follows the ADR shape: **Context** (the problem), **Decision**
(what we did), **Consequences** (what that costs or enables).

### EX-01 — Read the shared content, map `public/` to `static/`

**Context.** All kitchen-sinks read `examples/shared/content` and the media in
`examples/shared/public`. Tina refuses filesystem symlinks that point outside
the project for *content*, so content can't simply be symlinked. Other
frameworks serve assets from `public/`, but **SvelteKit serves them from
`static/`**.

**Decision.**
- Content: `localContentPath: "../../../shared"` in `tina/config.ts`, the
  Tina-aware way to read content from another folder.
- Media: `static/uploads` and `static/blocks` are symlinks to
  `../../../shared/public/*`, and Tina's media settings use
  `publicFolder: "static"`, `mediaRoot: "uploads"`.

**Consequences.** Same content and images as every other example, served at
`/uploads/…` and `/blocks/…`. Editing content here changes it for *all*
examples, so don't save test edits in the admin. A stray save once cleared a
shared post's author.

### EX-02 — Plain CSS with design tokens, not Tailwind

**Context.** The repo's standard stack for examples lists Tailwind 4. This
example was meant to stay small and dependency-light, and Svelte already
scopes styles per component.

**Decision.** Plain CSS. Design tokens are CSS custom properties in
`src/lib/styles/theme.css`, and `data-theme="blue|teal|…"` on the root
element switches the color palette. Each component has its own `<style>`
block.

**Consequences.** No build-time CSS tooling, and the styles are easy to read.
It is a **deliberate deviation** from the repo standard: reviewers may ask
about it, and porting markup from the Next example means translating
Tailwind classes into CSS.

### EX-03 — `#lib/*` subpath imports instead of `$lib`

**Context.** SvelteKit 3 **removed** the `$lib` alias. Using it raises
"`$lib` has been removed. Use `#lib` instead".

**Decision.** Use Node's standard package
[subpath imports](https://nodejs.org/api/packages.html#subpath-imports),
declared in `package.json` under `"imports"`: `#lib/*` → `src/lib/*`,
`#tina/*` → `tina/*`.

**Consequences.** Imports look like `#lib/utils.ts`, and work in any
Node-aware tool, not only Vite.

### EX-04 — Rest parameters for nested documents

**Context.** Posts can live in folders
(`posts/my-folder/my-folder-b/deeply-nested.md`). A `[slug]` route matches a
single URL segment, so nested URLs returned 404.

**Decision.** Use `[...slug]` (it matches any number of segments) and build
links from `_sys.breadcrumbs.join('/')`. `_sys.filename` alone drops the
folders.

**Consequences.** Any depth works. `blog` and `authors` still use `[slug]`
because their shared content has no folders; switch them if that changes.

### EX-05 — A catch-all route for pages, and file links skip the router

**Context.** The Page collection has documents besides `home` (e.g.
`projects-built-with-tina`) that need URLs. The catch-all route
`[...urlSegments]` matches **every** URL, and SvelteKit's router handles every
link click in the app. So a nav link to `/admin/index.html` (a static file,
not a route) was routed to the page loader, which asked Tina for
`admin/index.html.md`.

**Decision.**
- `src/routes/[...urlSegments]/` renders page documents. `home` stays on `/`.
- `isFileLink(href)` (in `src/lib/utils.ts`) spots links whose last segment
  has a file extension. Nav links and action buttons add
  `data-sveltekit-reload` for those, so the browser loads them normally.
- The catch-all returns 404 for file-like paths without querying Tina.

**Consequences.** CMS editors can link to the admin, PDFs or downloads
safely. Any new link component that renders CMS URLs needs the same
`data-sveltekit-reload` check.

### EX-06 — Missing documents return 404

**Context.** `requestWithMetadata()` never throws (package SK-09): for a
missing document it returns empty data. The routes originally assumed it
would throw, so `/nope` rendered "No page data found" with status 200, and
`/posts/nope`, `/blog/nope`, `/authors/nope` crashed with 500.

**Decision.** Every dynamic route checks the data after loading, e.g.
`if (!postQuery.data.post) error(404, 'Post not found')`. `+error.svelte`
renders the 404 page.

**Consequences.** Correct status codes for search engines and monitoring. New
routes must copy the check (see the checklist below).

### EX-07 — Prerender everything

**Context.** The site should be deployable as plain files, and fast.

**Decision.** `export const prerender = true` in the root `+layout.ts`.
Dynamic routes export `entries()`, which lists every document so the
prerenderer knows which pages exist.

**Consequences.** Every page is HTML at build time. Live editing of
prerendered pages needs the island endpoint (EX-10); on a static host it
isn't available.

### EX-08 — Build inside Tina's CLI

**Context.** Prerendering queries Tina's GraphQL API. In local mode that API
is a server started by the Tina CLI. With `tinacms build && vite build`, the
CLI has already exited when SvelteKit starts querying.

**Decision.** Run Vite *through* the CLI:
`tinacms build --local --skip-cloud-checks -c "vite build"`. The CLI keeps
its server up while the command runs. `TINA_PUBLIC_IS_LOCAL=true` selects the
local client. `build:pages` drops `--local` to build against TinaCloud.

**Consequences.** Builds are self-contained. Two Tina processes can't run at
once, so stop `pnpm dev` before `pnpm build` (or run `vite build` alone while
dev's GraphQL server is up).

### EX-09 — Two adapters, chosen by an environment variable

**Context.** The example demonstrates both deployment styles: a server that
can refresh islands (hybrid) and plain files (static).

**Decision.** `vite.config.ts` picks `adapter-node` by default and
`adapter-static` when `TINA_STATIC_BUILD=true`. Static output goes to
`build-static/` (so it never overwrites the Node build in `build/`), uses
`strict: false` (the POST-only island route can't be prerendered) and writes
`404.html`. The static build also leaves out the bridge plugin.

| Script | Adapter | Live editing |
|---|---|---|
| `pnpm build` → `pnpm preview` / `pnpm start` | node | Yes (islands) |
| `pnpm build:static` | static | No; admin removed |
| `pnpm build:pages` | static | No; admin kept, TinaCloud |

**Consequences.** One codebase, three outputs. `preview` uses `vite preview`
because `node build` assumes `https` (package SK-13); `start` is for
production behind HTTPS or with `PROTOCOL_HEADER`.

### EX-10 — The island endpoint validates its input

**Context.** `src/routes/tina-island/[name]/+server.ts` receives a `slug`
from the request and turns it into a file path for Tina. Unchecked input
could ask for files outside the posts folder.

**Decision.** Every slug segment must match `[A-Za-z0-9_.-]+` and must not be
`.` or `..`; otherwise it's a 404. Dots are allowed because real filenames
have them (`tinacms-v0.69.7`). The first version rejected dots, which broke
live editing for that post.

**Consequences.** Path traversal is blocked while real slugs work. If a
collection allows other characters in filenames, widen the pattern there.

### EX-11 — `withBase()` for GitHub Pages project sites

**Context.** A project site is served under `/<repo>/`. SvelteKit's
`paths.base` fixes the URLs SvelteKit generates itself (its JS and CSS), but
**not** links you write (`href="/posts"`) or URLs typed into the CMS.
`actions/configure-pages` only patches `svelte.config.js`, which a SvelteKit 3
project doesn't have.

**Decision.**
- The workflow passes `configure-pages`'s `base_path` output as `BASE_PATH`.
  `vite.config.ts` sets `paths.base` from it, and `tina/config.ts` sets
  `build.basePath` so the admin's own assets resolve.
- `withBase(path)` wraps SvelteKit's `resolve()` for any string.
  `sanitizeHref` and `sanitizeImageSrc` call it for root-relative URLs, so
  every CMS link and image gets the prefix.
- Rich text uses the `a` and `img` overrides in
  `src/lib/components/markdown/` (the package renderer doesn't know the base).
- `paths.relative: false` in `vite.config.ts`. By default SvelteKit makes
  `resolve()` return **page-relative** paths during server rendering
  (`../uploads/x.avif` on `/posts/a`). That string is only right for the page
  it was rendered on. After client-side navigation or a live-preview update,
  the same data is shown at another folder depth: `../uploads` then points to
  `/posts/uploads/…`, the request hits the posts route, and Tina is asked for
  a post called `uploads/x.avif.md`. That's how images on nested posts
  disappeared in the live preview. Absolute paths (`/uploads/…`, or
  `/<repo>/uploads/…` with a base path) are correct everywhere.

**Consequences.** The same code works at the domain root (where `BASE_PATH` is
empty and `withBase` changes nothing) and under a subpath. A missed link
fails the build: SvelteKit's prerenderer reports
`prerender_path_outside_base` with the page and the URL.

### EX-12 — Every CMS URL is sanitized

**Context.** Editors can type any URL, including `javascript:…`. The header
nav and action buttons originally rendered CMS links directly.

**Decision.** All CMS-controlled `href` and `src` values go through
`sanitizeHref` / `sanitizeImageSrc` in `src/lib/utils.ts`. They allow
relative paths, `http(s):` and `mailto:`, and block dangerous schemes and
protocol-relative URLs.

**Consequences.** Safe by default. New components must use them too (the
shared examples guide requires it).

### EX-13 — Components receive queries and call `useTina`

**Context.** Route components should stay thin, and the subscription logic
shouldn't be repeated.

**Decision.** Routes pass the query result to a component in
`src/lib/components/tina/` (`PageRenderer`, `PostDetail`, `BlogDetail`,
`AuthorDetail`). Each calls `useTina(() => query)`. The root layout does the
same for the global settings.

**Consequences.** One pattern everywhere. UI components that receive
`data-tina-field` must forward it to their element. `Card` once didn't, so
clicking a feature card didn't focus its field (`svelte-check` had been
reporting it as a type error). `Card.svelte.spec.ts` now guards this; run the
example's component tests with `pnpm test`.

### EX-14 — Markdown components are registered in one place

**Context.** Posts use MDX components (`<DateTime />`, `<BlockQuote>`) and a
Hugo-style shortcode (`{{% pull-quote %}}`).

**Decision.** `src/lib/components/markdown/index.ts` maps template names to
Svelte components and is passed as `components` to every `TinaMarkdown`
that renders CMS rich text. Shortcodes need a `match` in the template schema
(`post.tsx`): `match: { start: '{{%', name: 'pull-quote', end: '%}}' }`.

**Consequences.** Adding a component means: schema template, Svelte
component, one line in `index.ts`.

## Known issues and differences from the reference

- **Theme colors.** The `color` field was missing from the global schema, so
  the theme was always blue. It's back, as a plain select (the Next example
  uses a React color picker), with palettes for all nine options in
  `theme.css`. "White" is a neutral gray accent, since pure white would be
  invisible on light pages.
- **Tailwind.** Not used (EX-02).
- **Clicking a post's author block doesn't focus the Author field.** The
  block is marked correctly (`tinaField(post, 'author')`, the same as the
  Next.js reference) and the admin selects the right field, but Tina's
  reference field doesn't focus itself. The same goes for the author page's
  `hobbies` list. See "Known limitations" in the package's
  [DESIGN.md](../../../packages/@tinacms/sveltekit/DESIGN.md).
- **Clicking around the hero (or CTA) buttons shows empty, editable fields.**
  The wrapper is marked with the whole `actions` list (as in the Next.js
  reference), and Tina's admin opens an index-less copy of the button's
  fields for it. Click a button itself to edit it, and don't type into those
  empty fields. Details in the package's
  [DESIGN.md](../../../packages/@tinacms/sveltekit/DESIGN.md) under "Known
  limitations".
- **GitHub Pages + TinaCloud is untested.** In particular, TinaCloud may not
  index content that lives outside the Tina folder (`localContentPath`). See
  [DEPLOY.md](./DEPLOY.md).
- **`svelte-check` noise.** It also reports errors from
  `tina/__generated__/` and the core `tinacms` sources, because of the
  tsconfig scope. Filter with
  `--output machine | grep ERROR | grep '"src/'`.
- **No automated end-to-end tests** yet. The other examples use Playwright
  suites (`e2e/`); this one was checked with Playwright by hand.

## Checklist for adding a new route

1. Load with `requestWithMetadata(query, event, { priority: 'primary' })`.
2. Return a 404 when the document is missing (EX-06).
3. Export `entries()` if the route has parameters (EX-07).
4. Use `[...param]` if documents can be nested (EX-04).
5. Render through a component that calls `useTina(() => query)` (EX-13).
6. Mark editable elements with `data-tina-field={tinaField(obj, 'field')}`.
7. Send CMS URLs through `sanitizeHref` / `sanitizeImageSrc` (EX-11, EX-12).
8. Build once with `BASE_PATH=/test pnpm build:static` to catch missed
   base-path links.
