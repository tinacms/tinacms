---
"@tinacms/astro": minor
---

Add official support for Astro 7. The `astro` peer dependency is now `^5.0.0 || ^6.0.0 || ^7.0.0`, so Astro 5 and 6 consumers continue to work without changes. The package's own test suite and the `examples/astro/visual-editing` reference app (which consumes `@tinacms/astro`) have been bumped to Astro 7 to exercise the new version in CI. The `examples/astro/kitchen-sink` app stays on Astro 6 for now, since moving it to Astro 7 (Vite 8) needs a separate Tailwind PostCSS-to-Vite-plugin migration and it uses its own integration rather than `@tinacms/astro`.
