# @tinacms/bridge

The framework-agnostic core of TinaCMS visual editing for frontends that don't use React. It has two halves:

- **The client bundle** (`.`), served to the preview iframe as `/admin/bridge.js`. It talks to the Tina admin over `postMessage`, announces the page's forms, handles click-to-focus, and keeps island regions current while the editor types.
- **Server helpers** (the other entry points), which framework adapters such as `@tinacms/astro` and `@tinacms/sveltekit` build on so they share one implementation.

Most projects install an adapter rather than using this package directly.

## Entry points

| Import | Runs on | Exports |
|---|---|---|
| `@tinacms/bridge` | Browser (as `/admin/bridge.js`) | `init`, `refreshForms`, `tinaField`, protocol types |
| `@tinacms/bridge/tina-field` | Anywhere | `tinaField` |
| `@tinacms/bridge/metadata` | Anywhere | `addMetadata`, `hashFromQuery` |
| `@tinacms/bridge/preview` | Server | `PREVIEW_CONTENT_TYPE`, `PRIME_HEADER`, `readEnvelope`, `readOverlay` |
| `@tinacms/bridge/quick-edit-css` | Anywhere | `QUICK_EDIT_CSS` and its class/id names |
| `@tinacms/bridge/edit-mode` | Server | `isEditMode`, `readCookie`, `EDIT_COOKIE`, `EDIT_COOKIE_HEADER` |
| `@tinacms/bridge/form-payload` | Server | `CollectedForm`, `addForm`, `sortByPriority`, `renderFormPayload`, `renderPageFormPayloads` |
| `@tinacms/bridge/island` | Server | `handleIslandRequest`, `assertValidIslands`, `IslandWrapper`, `IslandRender`, `IslandRequest` |
| `@tinacms/bridge/sanitize` | Anywhere | `sanitizeHref`, `sanitizeImageSrc`, `sanitizeCssColor` |
| `@tinacms/bridge/dev-server` | Node only | `BRIDGE_ROUTE`, `bridgeBundlePath`, `readBridgeBundle`, `serveBridge` |

Everything except `dev-server` uses only Web APIs (`Request`, `Response`, streams), so it also runs on edge runtimes.

## How an adapter fits together

1. **Edit mode.** For each request, `isEditMode(request)` tells whether the page is rendering inside the admin iframe. On edit-mode responses the adapter appends `EDIT_COOKIE_HEADER` as a `Set-Cookie` so in-iframe navigation stays in edit mode. Top-level visits never are.
2. **Forms.** While rendering, the adapter records every Tina query it ran with `addForm(forms, form)`. On edit-mode HTML it writes `renderPageFormPayloads(forms)` before `</head>` (pass `'template'` when the framework hydrates `<head>`: a `<div>` there ends the head early). The bridge reads these `[data-tina-form]` elements and opens the forms in the admin; `data-tina-primary` marks the form the editor opens first.
3. **The bridge bundle.** Serve the client bundle at `/admin/bridge.js`: `serveBridge` is a connect middleware for Vite dev servers, and `bridgeBundlePath()` / `readBridgeBundle()` give builds the file to copy. Start it in the iframe with `init()`, and call `refreshForms()` after a client-side navigation.
4. **Islands** (optional). See below.

## Islands

An island is a page region the bridge can refresh from the server. It's how pages with no client-side framework stay live while the editor types, and how prerendered pages (built without any form payloads) get their forms.

On the page, the region's outer element carries the endpoint it refreshes from:

```html
<article class="prose" data-tina-island="/tina-island/post?slug=hello" data-tina-island-primary>…</article>
```

- On every edit, the bridge POSTs the editor's unsaved data (`Content-Type: application/x-tina-preview+json`, a JSON object keyed by form id) to each island's endpoint, then replaces the region's children with the response's.
- On a page with no server-written `[data-tina-form]`, the bridge primes once on load: the same POST with the `X-Tina-Prime` header. The endpoint then puts the forms it used before the region HTML. `data-tina-island-primary` marks the island whose first form the editor opens.

On the server, an adapter answers that endpoint with `handleIslandRequest`, passing only the framework-specific step:

```ts
import { assertValidIslands, handleIslandRequest } from '@tinacms/bridge/island';

assertValidIslands(islands); // once, at startup: throws on a bad name or a void wrapper tag

export function POST(request: Request, name: string) {
  return handleIslandRequest({
    request,
    name,
    islands,
    // Load the data (loaders read the unsaved overlay with readOverlay) and render.
    render: async (island) => ({ html: await renderMyComponent(island, request), forms: collectedForms }),
  });
}
```

`handleIslandRequest` only accepts the bridge's own request shape. Anything else gets a plain-text error with `Cache-Control: no-store`:

| Request | Response |
|---|---|
| Not a `POST` | 405 |
| Content type isn't the preview type | 404 |
| `Origin` missing; `Sec-Fetch-Site` present and not `same-origin`; or, without `Sec-Fetch-Site`, `Origin` not the request URL's origin | 403 |
| Body over 1 MB (declared or streamed) | 413 |
| Body missing or not a JSON object | 400 |
| Island name not registered (own properties only) | 404 |
| `render` throws | 500, with no error detail |

A successful response is `text/html` with `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. It contains the rendered HTML inside the island's wrapper element (escaped `class`, plus the request path as `data-tina-island`). On a prime request, the form payloads come first, and only a form recorded with `priority: 'primary'` gets `data-tina-primary`.

The origin check trusts the browser's `Sec-Fetch-Site` header when it's present, because behind a proxy (or on an adapter that only trusts configured hosts) the URL the server sees can differ from the one the browser used. Only requests without it are compared against the request URL.

Never choose a component from request input: the registry is the allow-list.

## Development

```sh
pnpm build   # dist/, one file per entry point
pnpm types   # tsc
pnpm test    # vitest (happy-dom; server helpers' tests run in the node environment)
```
