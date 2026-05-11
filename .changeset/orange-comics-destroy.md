---
"@tinacms/bridge": minor
"tinacms": minor
---

✨ **Visual editing for Astro — without React.**

TinaCMS visual editing previously required `useTina()`, a React hook that subscribes to admin postMessages and re-renders the page tree. That made it a hard sell for Astro: the framework is built around shipping zero JS by default, and the existing `examples/astro/kitchen-sink` worked around the React requirement by hydrating React inside the editor iframe — exactly the pattern Astro authors avoid.

This release ships a vanilla-JS bridge that brings the same click-to-focus, live-update, and form-syncing UX to Astro components, Hugo templates, plain HTML — anything that can emit a `data-tina-form` payload per query.

**New package: `@tinacms/bridge`**

A ~2 KB gzipped, zero-dependency ESM bundle that speaks the existing TinaCMS admin postMessage protocol. No React in the page tree, no client islands, no hydration cost outside the editor iframe.

Astro projects install `@tinacms/astro` instead and the bundled integration's middleware auto-injects everything on edit-mode responses. Direct `@tinacms/bridge` consumption is for non-Astro frontends:

```html
<head>
  <div data-tina-form='{"id":"…","query":"…","variables":{},"data":{}}' hidden></div>
  <script type="module">
    import { init } from '/_tina/bridge.js';
    init();
  </script>
</head>
```

The bridge submodules:

- **`init()`** — top-level entry. Detects iframe embedding, registers all `[data-tina-form]` payloads with the admin (with retry, since the bridge boots faster than the admin's listener), wires data updates and click-to-focus.
- **`refreshForms()`** — re-scans the DOM after soft navigations (Astro view transitions, Turbo, htmx). Posts `close` for forms that left and `open` for forms that appeared.
- **`tinaField()`** — framework-free field-id helper, identical API to `tinacms/dist/react`'s export. Use on any element to make it click-to-edit.
- **`@tinacms/bridge/preview`** — server-side helper for non-React frameworks. `readOverlay(request, queryId)` returns the unsaved form data the admin is editing, so per-route refresh endpoints can re-render with overlay data on every keystroke.

**How edits flow without re-rendering React**

The bridge takes a soft-refresh approach instead of in-place reconciliation. Mark editable regions with `data-tina-island="<endpoint-url>"`; on every form change the bridge POSTs the current overlay to that endpoint, the server renders the matching component to an HTML fragment, and the bridge swaps it into the live DOM. Per-island scoped — editing the hero refetches only the hero, not the whole page. The transport is JSON-over-POST so UTF-8 (em-dashes, smart quotes, emoji) and large rich-text bodies round-trip without size or charset limits.

**The protocol stays stateless** — admin pushes already-resolved data to the bridge, bridge forwards it to the island endpoint, endpoint reads it via `readOverlay()` instead of hitting the canonical content store. Works identically against self-hosted Tina, TinaCloud, or any GraphQL endpoint. No backend changes shipped.

**`tinacms`: framework-free `tinaField` subpath**

`tinaField()` was already pure — just reads `_content_source` metadata. It's now exported from `tinacms/tina-field` as a standalone module so non-React frontends can import it without pulling React (and Plate, and dnd-kit, and ~50 other React deps) into their bundle. The existing `tinacms/dist/react` re-export keeps the public API stable.

**Reference example: `examples/astro/visual-editing`**

A new Astro 5 example that mirrors `examples/astro/kitchen-sink` field-for-field — same six collections (Tag, Author, Global, Post, Blog, Page), same shared content via `localContentPath`, same eight routes — but rendered with pure Astro components instead of React islands. Includes:

- The **`@tinacms/astro` package's `TinaMarkdown`** — a vanilla Astro rich-text renderer that walks the Plate AST Tina returns, dispatches custom MDX components (NewsletterSignup, BlockQuote, DateTime, code blocks) by name to authored Astro components — the same `components` map shape as `TinaMarkdown` from `tinacms/dist/rich-text`, but emitting Astro markup
- An island-refresh pattern: one dynamic endpoint at `src/pages/tina-island/[name].ts` backed by a registry in `src/lib/islands.ts`. The endpoint uses Astro's `experimental_AstroContainer` to render the matching component as a fragment-only response. Adding a new editable region is one entry in the registry
- Multi-form pages: layout fetches global, route fetches its primary collection, both register independently — admin shows the right form based on which marked element you click
- A **`requestWithMetadata()`** helper wrapping every data load so the same code path runs in production (no overlay → real fetch) and inside the editor (overlay → use the bridge payload). Production builds ship zero bridge JS to non-admin visitors

**Why this matters for the Astro community**

Astro is the second-most-starred meta-framework on GitHub and grew specifically because authors care about runtime cost. Every previous attempt to integrate a React-based CMS into Astro carried the same caveat: "but you'll need to ship React for editing." That caveat is now gone. The bridge is the smallest piece of JS that can deliver Tina's full editing experience — click to focus, live preview as you type, click-to-edit overlays — to a framework whose audience explicitly didn't sign up for React.

**Known content-shape note**

For nested MDX components in rich-text bodies (e.g. `<NewsletterSignup>` inside a post's `_body`) to render via the Astro renderer instead of as raw HTML, the content needs to be authored through the Tina editor — which inserts them as MDX templates that Tina parses into `mdxJsxFlowElement` nodes. Hand-authored `<Component>` syntax in the markdown source is currently parsed as `html` by Tina's MDX layer; same behaviour as the React renderer. Worth flagging up-front for anyone migrating existing markdown content.

**Soft-navigation support: `refreshForms()`**

`init()` scans `[data-tina-form]` elements once on first load and captures the resulting set in closure. Sites using Astro's `<ClientRouter />` (or any view-transitions setup that swaps the DOM without a full reload) would post the first page's forms to the admin and never refresh them — navigating between docs inside the editor iframe left the sidebar showing the previous page's form.

`refreshForms()` re-scans the live DOM, diffs against the previously-mounted set, and posts `close` for forms that disappeared and `open` (with the same retry-until-acked behaviour as `init`) for forms that appeared. The one-time global listeners — `click` capture, the `updateData` ack handler, the `beforeunload` close — stay bound across refreshes, so calling it on every navigation is cheap and idempotent. The Astro integration wires it to `astro:page-load` automatically.

**Sticky edit-mode**

A `__tina_edit` session cookie (SameSite=Strict, gated on `Sec-Fetch-Dest: iframe`) keeps the iframe in edit mode across in-iframe link clicks — without it, clicking a link inside the preview drops the `/admin/` Referer and the next request falls out of edit mode. Top-level visitors never get edit mode because the dest check fails before the cookie is consulted, so production HTML is unaffected.

**Out of scope (follow-ups)**

- Hugo / Eleventy adapters using the same bridge — the contract is framework-free, just needs an integration guide
- TinaCloud overlay channel — not needed; the stateless POST protocol works against any backend
