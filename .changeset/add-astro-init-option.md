---
"@tinacms/cli": minor
---

Add **Astro** as a first-class framework option in `tinacms init`. Selecting Astro auto-sets the public assets folder to `public` (no prompt) and wraps the `package.json` `dev`/`build` scripts (`tinacms dev -c "astro dev"` and `tinacms build && astro build`), so `<package-manager> dev` runs Tina and Astro together. This configures the basic editor; React-free visual editing via `@tinacms/astro` remains a documented follow-up step.
