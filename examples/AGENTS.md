# TinaCMS Examples

Framework example apps that demonstrate TinaCMS against the same content model. Each app is independently runnable and has its own AGENTS.md covering framework-specific patterns. This file documents everything **shared** across them — per SSW, agents auto-inject every parent AGENTS.md up the path, so children should stay delta-only.

## Apps

- [next/kitchen-sink](next/kitchen-sink/AGENTS.md) — Next.js 15 App Router with `useTina()` visual editing.
- [next/tina-self-hosted-demo](next/tina-self-hosted-demo/AGENTS.md) — Next.js Pages Router with self-hosted backend (MongoDB, GitHub, `tinacms-authjs`). **Does not consume shared content** — keeps its own `content/`.
- [astro/kitchen-sink](astro/kitchen-sink/AGENTS.md) — Astro 5 static site with zero-JS production output.
- [hugo/kitchen-sink](hugo/kitchen-sink/AGENTS.md) — Hugo Extended static site, admin-panel editing only.
- [react/kitchen-sink](react/kitchen-sink/AGENTS.md) — Vite + React 18 SPA with runtime Tina client queries.

Shared content lives under [shared/](shared/) (no AGENTS.md — its contract is documented here).

## Shared Content Contract

Content files and shared media live in [shared/](shared/) as a single source of truth. Every kitchen-sink app reads the same files. The self-hosted demo does NOT — it keeps its own content for the auth/DB walkthrough.

### How each app consumes shared content

| App | Content | Static assets |
|-----|---------|---------------|
| Next / Astro / React | `localContentPath: '../../../shared'` in `tina/config.tsx` | `public/uploads` and `public/blocks` symlinks to `../../../shared/public/*` |
| Hugo | `[[module.mounts]]` in `hugo.toml` (NOT symlinks — Hugo's Go file walker doesn't follow directory symlinks on Windows) | `static/uploads` and `static/blocks` symlinks to `../../shared/public/*` |

TinaCMS's `assertWithinBase` security check rejects symlinks that resolve outside the project root, which is why content is accessed via `localContentPath` (TinaCMS-aware) or Hugo module mounts instead of filesystem symlinks. Only static asset directories are symlinked — TinaCMS doesn't walk those.

### Shared directory layout

```
shared/
├── content/
│   ├── authors/      # .md — markdown frontmatter with avatar, hobbies
│   ├── blogs/        # .md — hero image, dates, author ref, body
│   ├── global/       # .json — header nav, footer links, theme settings
│   ├── pages/        # .md — block-based (hero, features, cta, testimonial, content)
│   ├── posts/        # .md — author ref, tags, nested folders allowed
│   └── tags/         # .json — simple tag records
├── public/
│   ├── blocks/       # Block preview images used in the admin UI
│   └── uploads/      # User-uploaded media
└── .gitignore        # Ignores /content/**/e2e-*
```

## Shared TinaCMS Patterns

The kitchen-sink apps (everything except the self-hosted demo) share these TinaCMS conventions. Children document only their framework-specific wrapping.

### `useTina()` + `tinaField()`

Canonical client pattern: feed the query result into `useTina()`, then attach `data-tina-field={tinaField(node, 'fieldName')}` to any element that should be click-to-edit in the admin iframe.

```tsx
const { data } = useTina({ data, query, variables });
<h1 data-tina-field={tinaField(data.post, 'title')}>{data.post.title}</h1>
```

Per-framework specifics (Next App Router server/client split, Astro `client:tina` directive, React `useTinaQuery` hook) live in each app's AGENTS.md. Hugo doesn't use this — it's admin-panel-only.

### Block dispatcher

Page collection uses a block dispatcher under `components/blocks/index.tsx` (or `layouts/partials/blocks/` for Hugo). It maps the GraphQL `__typename` (e.g. `PageBlocksHero`) to a block component. The 5 block templates are `hero`, `features`, `cta`, `testimonial`, `content`. Block schemas live in `tina/schemas/blocks.ts` (shared across React-ish apps); Hugo inlines the equivalent in `page.tsx` via cascade.

### `TinaMarkdown` custom components

Rich-text bodies render via `<TinaMarkdown components={customComponents} content={data._body} />`. Every React-ish app (Next / Astro / React) ships the same four custom components:

- `code_block` — lazy-loads Prism from `tinacms/dist/rich-text/prism` to keep the highlighter out of the main bundle.
- `BlockQuote` — nests another `TinaMarkdown` for the quote body, with optional author attribution.
- `DateTime` — formats the current date (iso / utc / local).
- `NewsletterSignup` — UI-only stub with a `TODO: integrate with an actual newsletter service`.

Hugo renders body content via Goldmark instead and does not support these custom templates.

### Image sanitisation

CMS-controlled image and link URLs must pass through `sanitizeImageSrc()` / `sanitizeHref()` (in each app's `lib/utils.ts` or `src/lib/utils.ts`) to block `javascript:`, `data:`, `vbscript:`, and protocol-relative URLs. Hugo uses inline `hasPrefix` checks in templates for the same purpose. Don't render raw `data.*.image` / href values without running them through sanitisation.

### Tailwind theme

Theme colors use CSS custom properties driven by a `data-theme` attribute on the root div. Each app's `tailwind.config.js` maps `theme-*` utilities (`bg-theme-400`, `text-theme-600`) to `var(--theme-*)` tokens declared in its global CSS. The `data-theme` value (e.g. `blue`, `teal`) comes from the Global collection's theme settings. Dark mode uses Tailwind's `dark:` variant with class-based toggling.

### TinaCMS admin UI — selectors and behaviour

These patterns are not obvious from TinaCMS source; they were discovered through E2E debugging and apply to every app's admin panel.

- **"Enter Edit Mode" dialog:** Appears once per browser context on first admin visit. Target with `button[data-test="enter-edit-mode"]`. State persists in localStorage — won't reappear after dismissal in the same context. Each Playwright test gets a fresh context, so the dialog appears on every test.
- **Error modals:** Render in `#modal-root` with a backdrop that blocks all pointer events. Close buttons match `#modal-root button:has-text("Close")` or `#modal-root button:has-text("OK")`.
- **Save button states:** `opacity-70 cursor-wait` while submitting, `opacity-30 cursor-not-allowed` when pristine, `pointer-events-none` when validation fails. Shows `LoadingDots` during save, "Save" text when idle.
- **Field labels:** Standard fields use `<label>`. Block/list fields (e.g. "Sections", "Hobbies") render labels via `ListLabel` as `<span>` elements — target with `span:has-text("Sections")`.
- **Block items:** After adding a block, entries appear collapsed as `div[role="button"][aria-roledescription="sortable"]`. Click to expand and reveal form fields.
- **Block selector panel:** Opens in a `FormPortal`. Template cards are `<button>`. The add button is icon-only (`AddIcon` SVG) — target via `sectionsHeader.locator('button').first()`.
- **Validation:** Runs on change (not blur or submit). Inline `FieldError` appears immediately.
- **Post-save SPA redirect:** After creating a new document, TinaCMS may internally redirect (`/new/` → `/edit/`). Wait for the URL to stabilise after save before navigating elsewhere.

### Slugify behaviour

- **Default slugify** (no custom slugify, `isTitle: true` field): `values[titleField]?.replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, '')` — preserves case.
- **Custom `makeSlugify`** (used by post and blog collections in most apps): `title.toLowerCase().split(' ').join('-')` — forces lowercase.
- **`FilenameInput`:** Starts locked (`disabled`). For collections without custom slugify but with an `isTitle` field, TinaCMS creates a default slugify automatically. Let auto-slugify handle it — don't fill the filename input directly.

### GraphQL API quirks

- **`_sys` filter is NOT available:** Collection filter types (`AuthorFilter`, `PostFilter`, etc.) do NOT have a `_sys` field. You cannot filter connection queries by `relativePath` via `_sys`. Don't try to build `documentExists` queries using `_sys` filters.
- **Deleting non-existent documents:** The `deleteDocument` mutation logs server-side errors when the document doesn't exist. Use `fs.existsSync()` to check the file on disk before sending the mutation to avoid noisy console output.

## Cross-Cutting E2E Conventions

Every app's Playwright suite follows the same conventions. App-specific selectors and quirks live in each app's AGENTS.md; the admin-UI section above covers TinaCMS-level selectors.

- **Fixtures**: `e2e/fixtures/api-context.ts` exposes a GraphQL client for direct API ops. `e2e/fixtures/test-content.ts` provides the `contentCleanup` fixture.
- **Utils**: `e2e/utils/admin-helpers.ts` handles admin navigation (enter edit mode, save, dismiss dialogs). `e2e/utils/create-document.ts` / `delete-document.ts` send GraphQL mutations directly — faster and more deterministic than UI-driven setup.
- **Naming**: Test-created documents use the prefix `e2e-` and lowercase filenames (e.g. `e2e-playwright-author.md`). They're written to the shared content directory and ignored via `/content/**/e2e-*` in [shared/.gitignore](shared/.gitignore).
- **Isolation**: Each test is self-contained — creates its own data, doesn't depend on other tests. Register cleanup with `contentCleanup.track(collection, relativePath)` for automatic deletion after the test (even on failure).
- **Safety net**: A `beforeAll` cleanup step catches documents left behind by interrupted runs where fixture teardown didn't execute.
- **Assertions**: Never hard-code CMS-editable text. Assert on structural elements (headers, sections, card counts, navigation links) and route behaviour.
- **Waits**: Never use `page.waitForTimeout()`. Use observable conditions (`waitFor`, `toBeVisible`, `toHaveClass`, `waitForURL`).
- **Optional UI**: Use `Promise.race` (not sequential try/catch) when waiting for optional UI elements like dialogs — race the dialog against actual content appearing.

## Further Reading

- Root [AGENTS.md](../AGENTS.md) — monorepo overview, pnpm workspace layout, unified content schema table (Tag / Author / Post / Blog / Page / Global), coding standards.
- Per-app AGENTS.md — framework-specific architecture, patterns, and quirks.
