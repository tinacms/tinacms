---
"@tinacms/cli": minor
---

Add **Astro** as a first-class framework in `tinacms init` (now listed first). Selecting Astro:

- auto-sets the public assets folder to `public` (no prompt) and wraps the `package.json` `dev`/`build` scripts (`tinacms dev -c "astro dev"`, `tinacms build && astro build`)
- installs `@tinacms/astro` plus an `@astrojs/node` adapter **pinned to the project's Astro major** (node 9 for Astro 5, node 10 for Astro 6), and matched `react`/`react-dom` (`^18.3.1`) as **dev dependencies** — the site stays React-free, but the admin SPA is built with React and a bare Astro project ships none (skipped when the project already declares both)
- wires `astro.config` for SSR + visual editing, or — when your config is already customized — prints exactly what to add
- scaffolds a self-contained, **fully editable** visual-editing demo at `/tinacms-demo`: a dark hero whose eyebrow, headline, tagline, and both call-to-action buttons (label + link) are all click-to-edit, with scoped styles and a procedural SVG starfield (no CSS framework or image assets). CMS-editable button links are passed through `sanitizeHref`.

The demo is scaffolded automatically with no opt-in (mirroring the Next.js init demo), and is skipped during Forestry migrations.
