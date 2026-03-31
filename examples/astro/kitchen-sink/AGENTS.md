# Astro Kitchen-Sink

The Astro version of the TinaCMS kitchen-sink example app. Built with Astro 5 and React 18, demonstrating all core TinaCMS features — visual editing, block-based pages, rich-text content, and multi-collection schemas — with zero client-side JS in production.

## Architecture

Three-layer component model:
1. **Astro pages** (`src/pages/*.astro`) — file-based routing, data fetching via Tina client, static generation with `getStaticPaths()`
2. **React page wrappers** (`src/components/tina/*.tsx`) — accept `data`/`query`/`variables` props, call `useTina()` for live editing. Used with `client:tina` directive.
3. **React rendering components** (`src/components/blocks/`, `src/components/layout/`, `src/components/ui/`) — pure rendering components for blocks, layout, and UI elements
4. **Markdown components** (`src/components/markdown-components.tsx`) — custom TinaMarkdown renderers (BlockQuote, DateTime, NewsletterSignup, Prism code blocks). Astro handles code splitting at the island level, so all imports are static.

## Collections

6 TinaCMS collections:
- **Tag** (`tina/collections/tag.ts`) — simple JSON tags (css, html, react)
- **Author** (`tina/collections/author.tsx`) — markdown authors with avatar, description, hobbies
- **Global** (`tina/collections/global.ts`) — site-wide config (header nav, footer social links, theme settings)
- **Post** (`tina/collections/post.tsx`) — MDX posts with rich-text excerpt, author reference, tags, nested folder support
- **Blog** (`tina/collections/blog.tsx`) — MDX blog entries with hero image, pub/updated dates, author reference
- **Page** (`tina/collections/page.tsx`) — MDX pages with block-based content (hero, features, CTA, testimonial, content blocks)

## Key Patterns

- **`client:tina` directive:** Custom Astro client directive that only hydrates React components inside the TinaCMS visual editor iframe. Zero JS shipped in production. Defined in `astro-tina-directive/` (3 files: `register.js`, `tina.js`, `index.d.ts`).
- **`client:load` for interactive components:** Use `client:load` for React components that need JS but aren't Tina-connected (e.g., Header with mobile nav drawer). These hydrate immediately on page load.
- **`useTina()` + `tinaField()`:** React page wrappers in `src/components/tina/` import from `tinacms/dist/react`. `useTina({ query, variables, data })` enables live editing; `tinaField(data.author, 'name')` enables click-to-edit targeting via `data-tina-field` attribute.
- **Layout context via props:** Global data (header, footer, theme) is fetched server-side in `Layout.astro` and passed as props to React components. This avoids client-side context providers and keeps production pages JS-free.
- **Block-based pages:** Page collection uses a block dispatcher (`src/components/blocks/index.tsx`) that maps `__typename` to block components. Block schemas are extracted to `tina/schemas/blocks.ts`.
- **Schemas:** Shared fields in `tina/schemas/shared-fields.ts` (e.g., `dateFieldSchemas`, `makeSlugify`, `actionsFieldSchema`, `colorFieldSchema`). Block schemas in `tina/schemas/blocks.ts`, icon schema in `tina/schemas/icon.ts`. Schemas are centralised in `tina/schemas/` to avoid cross-directory imports between `tina/` and `src/`.
- **Content directory:** Content is served from `examples/shared/content/` via `localContentPath` in tina config. Collection paths (e.g., `content/authors`) are relative to the shared root. Do NOT use `src/content/` — that's Astro's built-in Content Collections, which this project does not use.
- **Path alias:** `@/*` maps to `./src/*` (standard Astro convention). Configured in `tsconfig.json`.
- **tina/ imports:** Files in `tina/` are outside `src/`, so they cannot use the `@/*` alias. Use relative paths instead (e.g., `../../src/lib/utils` in `tina/fields/color.tsx`).
- **Image handling:** Uses standard `<img>` tags with `sanitizeImageSrc()` for safe rendering of CMS-controlled image URLs.
- **Static generation:** All pages are statically generated at build time. Dynamic routes use `getStaticPaths()` to enumerate content.

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

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | `index.astro` | Home page with block-based content |
| `/posts/` | `posts/index.astro` | Post listing with author avatars and dates |
| `/posts/:slug` | `posts/[...urlSegments].astro` | Post detail (supports nested paths like `/posts/my-folder/a-sub-file`) |
| `/blog/` | `blog/index.astro` | Blog listing with hero images and card grid |
| `/blog/:filename` | `blog/[filename].astro` | Blog detail with hero, author, dates, rich-text body |
| `/authors/` | `authors/index.astro` | Author listing with avatars, descriptions, hobby badges |
| `/authors/:filename` | `authors/[filename].astro` | Author detail with gradient title, hobbies |
| `/:slug` | `[...urlSegments].astro` | Catch-all for page collection (e.g., `/projects-built-with-tina`) |
| `/admin/` | `public/admin/index.html` | TinaCMS admin panel (generated at build) |

## Formatting

This project uses **Biome** for code formatting. Run `npx @biomejs/biome format --write <file>` after creating or modifying files.

## `.tsx` vs `.astro` Files

All files in `src/components/` must remain `.tsx` — they run inside React islands (via `client:tina` or `client:load`) or are imported by other React components. Only `src/pages/*.astro` and `src/layouts/*.astro` are Astro files. Do not convert component `.tsx` files to `.astro`.

## `.astro` Template Rules

- Use `class` on native HTML elements in `.astro` templates, not `className` (which is React-specific).
- Do NOT add `key=` props in `.astro` template `.map()` calls — `key` is a React concept and renders as a meaningless HTML attribute in Astro. It is only needed inside `.tsx` React components.
- `className` on React component tags (e.g., `<Section className="...">`) is correct — these are React props, not HTML attributes.

## Tailwind Theme

Theme colors use CSS custom properties driven by a `data-theme` attribute on the root div. The `tailwind.config.js` maps `theme-*` utilities (e.g., `bg-theme-400`, `text-theme-600`) to `var(--theme-400)` etc. The `data-theme` value (e.g., `blue`, `teal`) is set from the Global collection's theme settings. Dark mode uses Tailwind's `dark:` variant with class-based toggling.

## Dynamic vs Static Client Import

In `.astro` page frontmatter, the Tina client can be imported two ways:
- **Static:** `import client from '../../tina/__generated__/client';` — use when the import path is straightforward
- **Dynamic:** `const client = (await import('../../tina/__generated__/client')).default;` — use when static import causes issues (e.g., in pages with `getStaticPaths()` where the module needs to be resolved at runtime)

Both are functionally equivalent. Be consistent within a file.

## Gotchas

- **Rollup warning:** TinaCMS generated files trigger `UNUSED_EXTERNAL_IMPORT` in Vite/Rollup. Suppressed in `astro.config.mjs` with `onwarn` handler (upstream: tinacms/tinacms#6386).
- **`client:tina` vs `client:load`:** Use `client:tina` for components that call `useTina()` — they must only hydrate inside the editor iframe. Use `client:load` for interactive components that need JS but aren't Tina-connected (e.g., mobile nav drawer).
- **`react-icons` SSR:** `react-icons` uses directory imports that Node ESM doesn't support. Fixed with `vite.ssr.noExternal: ['react-icons']` in `astro.config.mjs` so Vite bundles it during SSR.
- **CodeQL false positive on `sanitizeImageSrc`:** GitHub CodeQL flags `<img src={avatarSrc}>` as "Client-side cross-site scripting" even when the value is already sanitized by `sanitizeImageSrc()`. This is a false positive — data is CMS-controlled, already sanitized, and it's an `<img>` not a redirect.

## E2E Tests

Playwright test suite in `e2e/` covering frontend pages and admin panel CRUD. Run with `pnpm test:e2e`.

### Structure

- `e2e/*.spec.ts` — Frontend tests (pages, navigation, edge cases). Fully parallel, no auth.
- `e2e/admin/*.spec.ts` — Admin panel tests (author, blog, post, page CRUD). Serial within each collection, parallel across collections.
- `e2e/fixtures/` — `api-context.ts` (GraphQL API client), `test-content.ts` (`contentCleanup` fixture for automatic document deletion after each test).
- `e2e/utils/` — `admin-helpers.ts` (navigation, save, dialog dismissal), `create-document.ts` / `delete-document.ts` (GraphQL mutations).

### Shared Content

Content files live in `examples/shared/content/` (single source of truth for all kitchen-sink projects). Each project uses `localContentPath: '../../../shared'` in `tina/config.tsx` so TinaCMS reads content directly from the shared directory — no content symlinks needed. This avoids path traversal errors from TinaCMS's security checks (`assertWithinBase` rejects symlinks that resolve outside the project root).

Static assets (`public/uploads`, `public/blocks`) are still symlinked to `examples/shared/public/` since those are served by Astro, not TinaCMS.

Test-created files (prefixed `e2e-`) are physically written to the shared directory. The `.gitignore` pattern `/content/**/e2e-*` in `examples/shared/.gitignore` catches them.

### TinaCMS Admin UI — Selectors and Behavior

These patterns are not obvious from TinaCMS source code and were discovered through debugging:

- **"Enter Edit Mode" dialog:** Appears once per browser context on first admin visit. Target with `button[data-test="enter-edit-mode"]`. State persists in localStorage — won't reappear after dismissal in the same context. Each Playwright test gets a fresh context, so the dialog appears on every test.
- **Error modals:** Render in `#modal-root` with a backdrop that blocks all pointer events. Close buttons match `#modal-root button:has-text("Close")` or `#modal-root button:has-text("OK")`.
- **Save button states:** `opacity-70 cursor-wait` while submitting (busy), `opacity-30 cursor-not-allowed` when pristine (disabled), `pointer-events-none` when validation fails. Shows `LoadingDots` animation during save, "Save" text when idle.
- **Field labels:** Standard fields use `<label>`. Block/list fields (e.g., "Sections", "Hobbies") render labels via `ListLabel` as `<span>` elements, NOT `<label>`. Target with `span:has-text("Sections")`.
- **Block items:** After adding a block via the selector, blocks appear collapsed as `div[role="button"][aria-roledescription="sortable"]`. Must click to expand and reveal form fields.
- **Block selector panel:** Opens in a `FormPortal`. Block template cards are `<button>` elements. The add button is icon-only (no text, just `AddIcon` SVG) — target via `sectionsHeader.locator('button').first()`.
- **Validation:** Runs on change (not blur or submit). Inline `FieldError` appears immediately. No need to trigger blur.
- **Post-save SPA redirect:** After creating a new document, TinaCMS may internally redirect (e.g., `/new/` → `/edit/`). Always wait for URL to stabilize after save before navigating elsewhere.

### TinaCMS Slugify Behavior

- **Default slugify** (no custom slugify, `isTitle: true` field): `values[titleField]?.replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, '')` — preserves case.
- **Custom `makeSlugify`** (used by post, blog collections): `title.toLowerCase().split(' ').join('-')` — forces lowercase.
- **`FilenameInput`:** Starts locked (`disabled`). For collections without custom slugify but with an `isTitle` field, TinaCMS creates a default slugify automatically. Don't try to fill the filename input directly — let auto-slugify handle it.

### GraphQL API Quirks

- **`_sys` filter is NOT available:** Collection filter types (`AuthorFilter`, `PostFilter`, etc.) do NOT have a `_sys` field. You cannot filter connection queries by `relativePath` via `_sys`. Don't try to build `documentExists` queries using `_sys` filters.
- **Delete non-existent documents:** The `deleteDocument` mutation logs server-side errors when the document doesn't exist. Use `fs.existsSync()` to check the file on disk before sending the mutation to avoid noisy console output.

### Test Conventions

- All test document filenames are prefixed with `e2e-` and use lowercase (e.g., `e2e-playwright-author.md`).
- Each test is self-contained — creates its own data, doesn't depend on other tests.
- `contentCleanup.track(collection, relativePath)` registers documents for automatic deletion after the test (even on failure).
- `beforeAll` cleanup is a safety net for interrupted/crashed runs where fixture teardown didn't execute.
- Use `Promise.race` (not sequential try/catch) when waiting for optional UI elements like dialogs — race the dialog against actual content appearing.
- Never use `waitForTimeout` — always use observable conditions (`waitFor`, `toBeVisible`, `toHaveClass`, `waitForURL`, etc.).

## Reference

- **Shared content/assets:** `examples/shared/` — single source of truth for content files and public assets, symlinked by all kitchen-sink projects
- **Next.js kitchen-sink:** `examples/next/kitchen-sink/` — the Next.js version of this example app, useful for comparing approaches across frameworks
- **Astro starter:** `tinacms/tina-astro-starter` on GitHub — reference for directive setup, config structure, and Vite workarounds
