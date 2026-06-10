---
"@tinacms/cli": minor
---

Add **Astro** as a first-class framework option in `tinacms init` (now listed first). Selecting Astro:

- auto-sets the public assets folder to `public` (no prompt)
- wraps the `package.json` `dev`/`build` scripts (`tinacms dev -c "astro dev"`, `tinacms build && astro build`)
- scaffolds a self-contained **visual-editing demo** at `/tina-demo` — a data loader, island registry, per-island endpoint, a `<TinaIsland>` page, and a `<TinaMarkdown>` + `tinaField()` renderer — installs `@tinacms/astro` + `@astrojs/node`, and wires `astro.config` (or, when your config is already customized, prints exactly what to add)

The demo is scaffolded automatically with no opt-in, mirroring the Next.js init demo.
