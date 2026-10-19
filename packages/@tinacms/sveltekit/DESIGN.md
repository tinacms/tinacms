# `@tinacms/sveltekit` — design notes

This document explains **why** the package works the way it does. The
[README](./README.md) explains **how to use it**. Read this before changing the
package, or when something behaves in a way you don't expect.

It's written for someone new to the codebase: terms are explained the first
time they appear, and each decision says what problem it solves and what it
costs.

- [Words you'll see](#words-youll-see)
- [The big picture](#the-big-picture)
- [What happens during one edit](#what-happens-during-one-edit)
- [Where things live](#where-things-live)
- [Decisions](#decisions) (SK-01 … SK-15)
- [Known limitations](#known-limitations)
- [Lessons learned while building it](#lessons-learned-while-building-it)

## Words you'll see

| Word | Meaning here |
|---|---|
| **Admin** | Tina's editing app at `/admin/index.html`. It shows a form sidebar and your site in an `<iframe>`. |
| **Preview / iframe** | Your SvelteKit site, loaded inside the admin. |
| **Bridge** | A small script (`@tinacms/bridge`, served as `/admin/bridge.js`) that runs *inside the preview* and talks to the admin with `postMessage`. Shared with the Astro integration. |
| **Form** | Tina's description of one query (query text, variables, data, `id`). The admin builds a sidebar form from it. One page can have several (e.g. a post plus the global settings). |
| **Overlay** | The editor's *unsaved* data, sent back to the server so it can render the page as if the edit were saved. |
| **Hydration** | Svelte taking over server-rendered HTML in the browser. It expects the DOM to match what the server sent; if something changed it first, it warns `hydration_mismatch`. |
| **Prerendering** | Rendering a page to a static HTML file at build time instead of on each request. |
| **Island** | A marked region of a prerendered page that the bridge can re-render through a server endpoint, so static pages can still show live edits. |
| **Runes** | Svelte 5's reactivity syntax (`$state`, `$derived`, `$effect`). Only works in files the Svelte compiler processes (`.svelte`, `.svelte.ts`). |
| **ADR** | "Architecture decision record": a short note of a decision, why it was made, and its consequences. The [Decisions](#decisions) section uses that shape. |

## The big picture

```
┌──────────────────── Tina admin (/admin) ────────────────────┐
│  Sidebar form                    <iframe> = your site       │
│  ┌──────────────┐  postMessage   ┌───────────────────────┐  │
│  │ Title: [___] │ ─────────────▶ │ bridge.js             │  │
│  │              │ ◀───────────── │  ├ registers forms    │  │
│  └──────────────┘  focus/forms   │  ├ click-to-focus     │  │
│                                  │  └ island refresh     │  │
│                                  │ Svelte page + useTina │  │
│                                  └───────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          ▲ GraphQL (local server in dev, TinaCloud in production)
```

The package's job is the SvelteKit side of that picture:

1. On the **server**, record which Tina queries a page used, and hand them to
   the bridge (`requestWithMetadata`, `tinaHandle`).
2. In the **browser**, start the bridge and apply the editor's unsaved data to
   the page (`TinaBridge`, `useTina`).
3. Make content **clickable** (`tinaField`) and **renderable** (`TinaMarkdown`).
4. For **prerendered** pages, provide a way to re-render regions on demand
   (`TinaIsland`, the experimental endpoint).

## What happens during one edit

Follow one request from start to finish. This is the most useful thing to
understand before touching the code.

1. **The admin opens the preview.** The browser requests
   `/posts/hello` inside the iframe.
2. **`tinaHandle` decides "this is an editor request"** (`isEditMode`, see
   SK-02) and creates an empty form list on `event.locals` (SK-03).
3. **The page's `load` runs.** Each query goes through
   `requestWithMetadata(query, event)`, which:
   - hashes the query and variables into a stable form `id`;
   - applies the overlay if the request carries one;
   - adds field metadata, so `tinaField()` can later say which field an
     element shows;
   - records the form on `event.locals`.
4. **SvelteKit streams the HTML.** `tinaHandle` watches the chunks and, just
   before `</head>`, inserts one `<template data-tina-form="…">` per form
   (SK-05, SK-06).
5. **The browser hydrates the page.** Only *after* that, `TinaBridge`
   (in the root layout) imports `/admin/bridge.js` and calls `init()` (SK-07).
6. **The bridge reads the `<template>` payloads** and tells the admin which
   forms exist. The sidebar shows them.
7. **The editor types.** The admin sends `updateData` messages
   (`{ id, data }`) to the iframe.
8. **`useTina()` receives them** (through `subscribeToTinaData`) and swaps the
   page's data for the unsaved data. Svelte re-renders (SK-10).
9. **The editor clicks a heading.** The bridge reads its `data-tina-field`
   attribute and asks the admin to focus that field.
10. **The editor navigates to another post** inside the preview. SvelteKit
    navigates client-side; `TinaBridge` calls `refreshForms()` after
    navigation so the sidebar switches to the new page's forms.

For a **prerendered** page, step 2–4 never run (the HTML is a file). Instead
the bridge finds `TinaIsland` markers and asks the island endpoint for the
forms ("priming"), then re-renders those regions as the editor types (SK-13).

## Where things live

| File | Role |
|---|---|
| `src/is-edit-mode.ts` | Is this request coming from the Tina iframe? |
| `src/data.ts` | `requestWithMetadata()`, `subscribeToTinaData()` |
| `src/internal/forms-store.ts` | Per-request form list on `event.locals`; payload markup |
| `src/hooks.ts` | `tinaHandle`: streaming injection of form payloads |
| `src/vite.ts` | `tinaVitePlugin()`: serves/emits `/admin/bridge.js` |
| `src/TinaBridge.svelte` | Starts the bridge after hydration; refreshes on navigation |
| `src/use-tina.svelte.ts` | `useTina()`: live data for components |
| `src/TinaMarkdown.svelte`, `src/sanitize.ts`, `src/types.ts` | Rich-text renderer and its types |
| `src/TinaIsland.svelte`, `src/experimental/island.ts` | Island marker and endpoint (experimental) |
| `src/tina-field.ts` | Re-export of the bridge's `tinaField()` |
| `src/__tests__/` | `*.test.ts` run in Node; `*.browser.test.ts` run in headless Chromium |

## Decisions

Each record follows the ADR shape: **Context** (the problem), **Decision**
(what we did), **Consequences** (what that costs or enables).

### SK-01 — Follow the Astro integration, but speak SvelteKit

**Context.** `@tinacms/astro` already solves visual editing for a
server-rendered framework, and `@tinacms/bridge` is shared between
integrations. Reinventing the protocol would split behavior between
frameworks.

**Decision.** Keep the same moving parts and the same bridge, but map each one
to the SvelteKit feature built for it:

| Astro | SvelteKit |
|---|---|
| Middleware | A `Handle` hook (`tinaHandle`) |
| `requestWithMetadata(Astro)` | `requestWithMetadata(query, event)` in a server `load` |
| Islands + static endpoints | `TinaIsland.svelte` + a `+server.ts` POST route |
| Integration injecting the bridge | Vite plugin + `TinaBridge.svelte` |

**Consequences.** Bridge fixes benefit both frameworks. The API looks familiar
to Tina users, but each piece is plain SvelteKit, so it composes with other
hooks, adapters and layouts.

### SK-02 — Detect editor requests on the server

**Context.** Ordinary visitors must never receive form payloads (they're
extra bytes and expose query text). The server has to recognise the iframe.

**Decision.** `isEditMode(request)` returns true when any of these hold:
`?tina-edit=1` is in the URL (handy for debugging); the request is for an
iframe (`Sec-Fetch-Dest: iframe`) whose `Referer` is the same origin under
`/admin/`; or the `__tina_edit` cookie, which `tinaHandle` sets on editor
responses so follow-up navigations stay in edit mode, is present.

**Consequences.** Works without configuration. Relies on browser-sent headers,
so very old browsers may need the query parameter. The `/admin/` prefix is
hard-coded (see [Known limitations](#known-limitations)).

### SK-03 — Per-request form state lives on `event.locals`

**Context.** Several `load` functions (layout and page) run for one request.
Their forms must be collected *for that request only*, even when the server
handles many requests at once. Node offers `AsyncLocalStorage` for this, but
it doesn't exist on every edge runtime.

**Decision.** Store the list on SvelteKit's `event.locals`, which is created
fresh for every request and passed to every `load`.

**Consequences.** Portable to edge adapters, and impossible to leak between
requests (a test checks concurrent requests). The price: `requestWithMetadata`
needs the `event` argument.

### SK-04 — An explicit hook the app composes

**Context.** Apps often have their own hooks (auth, logging). Silently
patching `handle` would surprise them.

**Decision.** Export `tinaHandle` and ask the app to add it with SvelteKit's
`sequence(...)`.

**Consequences.** One extra line in `hooks.server.ts`, and full control over
ordering. Every hook in the sequence must call `resolve(event)`.

### SK-05 — Inject while the HTML streams

**Context.** SvelteKit streams HTML. Buffering the whole page just to insert a
few tags would delay the first byte for editors.

**Decision.** Use `resolve(event, { transformPageChunk })` and insert the
payloads before `</head>`. A small carry-over buffer handles a `</head>`
split across two chunks. Non-editor requests are returned untouched;
`content-length` is removed only from edited HTML (its length changed).

**Consequences.** No extra latency, and tests cover chunk boundaries and
streaming. The code is slightly more involved than a string replace.

### SK-06 — Payloads are `<template>` elements

**Context.** The first version injected `<div data-tina-form>` into `<head>`.
A `<div>` isn't allowed there, so the browser's HTML parser *closes the head
early* and moves everything after it — including SvelteKit's `<svelte:head>`
output — into `<body>`. Svelte then can't find those nodes and reports a
hydration mismatch, but only in the editor.

**Decision.** Render head payloads as `<template data-tina-form="…" hidden>`.
`<template>` is valid in `<head>`, and the bridge only reads attributes
(`[data-tina-form]`), so it doesn't care about the tag. The island endpoint
still uses `<div>`, because its HTML goes into the body.

**Consequences.** Head parsing stays intact. A test fails if a `<div>` ever
appears in the injected head again.

### SK-07 — The bridge starts after hydration, from `TinaBridge`

**Context.** The hook used to also inject
`<script type="module">import{init}from"/admin/bridge.js";init()</script>`.
That script ran *before* SvelteKit hydrated, and the bridge changes the DOM
when it starts (styles for click-to-focus, primed form elements). Hydration
then saw a different DOM and warned. This was proven in the browser by
stripping only that script: the warning disappeared and editing still worked.

**Decision.** The hook injects **no** script. `TinaBridge.svelte`, mounted
once in the root layout, imports the bridge in `onMount` (which runs after
hydration) and only when the page is inside an iframe. It also calls
`refreshForms()` after each client-side navigation (`afterNavigate`).

**Consequences.** No hydration warnings, one bridge instance. `TinaBridge` is
now **required**: without it the sidebar never receives forms. The bridge URL
is built at runtime with `/* @vite-ignore */`, so Vite doesn't try to resolve
`/admin/bridge.js` as a source module at build time.

### SK-08 — Deliver `bridge.js` with a Vite plugin

**Context.** The bridge must be reachable at `/admin/bridge.js` in dev and in
production builds. Copying it into the app's `static/` folder looked simple,
but Vite then treats it as a public file and refuses to let a component
import it.

**Decision.** `tinaVitePlugin()` serves the file from the installed
`@tinacms/bridge` package through dev-server middleware, and emits it into
the **client** build only (Vite 8's environment API), so it isn't duplicated
into the server bundle.

**Consequences.** Nothing to copy, nothing generated into `static/`. Builds
that don't need editing (the example's static build) simply leave the plugin
out.

### SK-09 — `requestWithMetadata` never throws

**Context.** A failing query (Tina server down, missing document) shouldn't
take the whole site down, and the layout's global query shouldn't break every
page.

**Decision.** Errors are caught and logged
(`[@tinacms/sveltekit] client query failed`), and the function returns a
result with **empty data** (`{}`) and a valid `id`.

**Consequences.** Pages degrade instead of crashing. But it is easy to misuse:
a `try/catch` around it never fires. **Routes must check the data themselves**
and return a 404, e.g. `if (!result.data.post) error(404, 'Not found')`. The
example once returned 200 or 500 for missing documents because of this.

### SK-10 — `useTina()` for live data

**Context.** Every page repeated ~10 lines: a `$state` for the preview, an
`$effect` subscribing to `updateData`, and a check that the update belongs to
the current query. Two details were easy to get wrong when copied: the **id
check** (SvelteKit reuses a component when you navigate between two posts, so
without it the new post briefly shows the old post's edits) and **reading the
query inside the effect** (so the subscription restarts after navigation).

**Decision.** `useTina(() => data.query)` returns `{ data }`, a getter that
yields unsaved data for the current query or the server data otherwise. It
takes a **getter**, not the value, so it keeps following `data` as it changes.
It stores the preview with `$state.raw` (no deep proxy; the bridge always sends
a whole new object). `subscribeToTinaData()` stays public for code outside
components.

**Consequences.** Pages shrink to one line. Rules to remember: pass a getter;
call it at the top of `<script>`; read `tina.data.x`, don't destructure it.
Biome's React rule (`useHookAtTopLevel`) flags it as a "hook"; those warnings
are false positives.

### SK-11 — Svelte files ship as source

**Context.** Components and runes only work after the Svelte compiler runs.
The repo's build (`tinacms-scripts`, esbuild) doesn't run it.

**Decision.** `package.json` exports point the components and
`use-tina.svelte.ts` at `src/` (with the `svelte` export condition). The
consuming app's Vite + Svelte plugin compiles them. Plain TypeScript modules
are built into `dist/` as usual.

**Consequences.**
- Verified with a real install from a packed tarball in a standalone SvelteKit
  3 app: client and server builds compile them from `node_modules`.
- Releasing must run `build` **and then** `types`. `build` writes placeholder
  `dist/*.d.ts` files (`export * from "../src/…"`) so dev mode skips
  TypeScript; `types` replaces them with real declarations. A tarball packed
  after `build` alone makes users type-check this package's source with their
  own settings (e.g. errors about `node:fs` without `@types/node`).
- Tests are excluded from the tarball (`"!src/__tests__"`).

### SK-12 — `TinaMarkdown` is a Svelte renderer with safe defaults

**Context.** Tina's rich text is a tree (`root → p → text`, plus lists,
tables, code blocks and MDX components). React has
`tinacms/dist/rich-text`; Svelte needs its own.

**Decision.**
- One component renders every node type recursively, with semantic default
  HTML and light `tina-markdown-*` styles. Any node can be replaced through
  `components` (by node type, or by MDX template name).
- **Safety:** `html` nodes are rendered as escaped text; link and image URLs
  go through `sanitize.ts` (blocks `javascript:`, `data:`, protocol-relative
  URLs). Never pass CMS HTML to `{@html}`.
- **Untyped leaves:** the editor sends newly typed text as `{ text }` without
  `type: 'text'`; the renderer treats any node with a string `text` as a leaf,
  like the React renderer does. (Before this, new paragraphs stayed empty in
  the live preview.)
- No syntax highlighter is bundled; apps add Shiki through a `code_block`
  override if they want it.
- Inside the renderer, overrides are looked up through an untyped helper
  (`override(key)`): indexing the typed map with a union key made TypeScript
  demand that one component satisfy every override's props at once.

**Consequences.** Safe by default and fully overridable. The renderer doesn't
know about the app's base path (see [Known limitations](#known-limitations)).

### SK-13 — Islands for prerendered pages are experimental

**Context.** Prerendered pages are files, so `tinaHandle` can't inject forms
into them. Astro solves this with islands: marked regions that a server
endpoint can re-render with the overlay.

**Decision.** `TinaIsland.svelte` writes a marker with an endpoint URL,
wrapper tag and parameters. `experimental_createIslandHandler(registry)`
builds the POST endpoint. The bridge first "primes" each island (gets its
forms), then re-renders it as the editor types. The endpoint is defensive:
same-origin requests only, the exact preview content type, a 1 MB body cap,
only components from an explicit registry (never chosen from request input),
and `Cache-Control: no-store`.

Which deployments support live editing:

| Deployment | Live editing |
|---|---|
| Server adapter, pages rendered per request | Yes (`tinaHandle`) |
| Server adapter, prerendered pages + island endpoint | Yes, experimental |
| Static files only (`adapter-static`, GitHub Pages) | No: no server to run the endpoint |

**Consequences.** Hybrid deployments work (verified in the browser on a Node
build). The **same-origin check needs the server to know the real protocol**:
`adapter-node` 6 assumes `https` unless `PROTOCOL_HEADER` is set, so
`node build` over plain `http://localhost` rejects the bridge with 403. Use
`vite preview` locally, HTTPS (or `PROTOCOL_HEADER`) in production. The API
keeps its `experimental_` name until it has been used in more projects.

### SK-14 — Toolchain: SvelteKit 3, Svelte 5 runes, TypeScript 6

**Context.** SvelteKit 3 requires Svelte ≥ 5.57.1, Vite 8, TypeScript 6 and
Node 22.17+, and it moved app config into the `sveltekit()` Vite plugin.

**Decision.** Target exactly that: peer dependencies `@sveltejs/kit ^3`,
`svelte ^5.57.1`, `vite ^8`; new components use runes only. The package
runs `svelte-check` (`pnpm check`) because plain `tsc` skips `.svelte` files,
which once hid nine type errors in `TinaMarkdown.svelte`.

**Consequences.** No Svelte 4 or SvelteKit 2 support.

### SK-15 — Test without a visible browser

**Context.** Development happened in WSL without a desktop browser, and
visual checks are slow and expensive.

**Decision.** Three layers:
1. **Node tests** (`pnpm test`): hook injection and streaming, form ordering,
   overlays, the island handler, the Vite plugin.
2. **Headless Chromium tests** (`pnpm test-browser`): rendering and
   reactivity, e.g. replaying editor updates with `rerender()`, and sending
   real `updateData` messages from the parent frame to test `useTina()`.
3. **End-to-end checks with Playwright** against the example (manual, run
   before merging): live edits, click-to-focus, navigation, island responses,
   console warnings.

**Consequences.** Most regressions are caught by fast tests. The end-to-end
checks are not automated in CI yet.

## Known limitations

- **Live editing under a base path.** The bridge URL (`/admin/bridge.js`),
  the Vite dev route and the edit-mode `Referer` check assume the site is
  served from `/`. Only `TinaIsland` accepts a `basePath`. Not an issue for
  GitHub Pages (no live editing there anyway), but a hybrid server deployed
  under a subpath won't enter edit mode.
- **`TinaMarkdown` and base paths.** Rich-text links and images aren't
  prefixed. Apps under a subpath need `a` and `img` overrides (the example
  ships them).
- **Separate-origin admin.** Hosting the admin on a different origin than the
  site isn't supported.
- **No live preview on static hosts.** Possible in principle (a build-time
  form file per page, read by the bridge in the browser), but not built.
- **No self-hosting helper.** There is no SvelteKit equivalent of Next's
  `/api/tina/[...routes]` backend route.
- **Content created in dev.** Whether Vite needs a watcher for documents and
  routes created in the admin during `pnpm dev` hasn't been investigated.
- **React warning in the admin.** "Maximum update depth exceeded" can appear
  when typing very fast. It comes from Tina's admin code (served from the
  Tina dev server), not from this package: one keystroke sends exactly one
  `updateData` per form and the preview sends nothing back.

## Lessons learned while building it

These cost real debugging time; they're here so nobody repeats them.

1. **Check where the HTML parser puts injected tags.** Invalid tags in
   `<head>` silently restructure the document (SK-06).
2. **Don't let scripts touch the DOM before hydration** (SK-07).
3. **Data from the editor isn't the same shape as data from the server**:
   new text nodes have no `type` (SK-12).
4. **`try/catch` around a function that never throws does nothing** (SK-09).
5. **`tsc` doesn't check `.svelte` files**; run `svelte-check` (SK-14).
6. **Test the tarball, not the workspace link.** The workspace hides how the
   package behaves in `node_modules` and with real `.d.ts` files (SK-11).
7. **Behind a proxy, the server's idea of "origin" can differ from the
   browser's** (SK-13).
