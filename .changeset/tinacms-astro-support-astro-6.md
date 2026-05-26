---
"@tinacms/astro": minor
---

Add official support for Astro 6. The `astro` peer dependency is now `^5.0.0 || ^6.0.0`, so Astro 5 consumers continue to work without changes. The package's own tests and the monorepo's `astro/kitchen-sink` and `astro/visual-editing` example apps have been bumped to Astro 6 to exercise the new version in CI.
