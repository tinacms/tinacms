---
"@tinacms/astro": minor
---

Add official support for Astro 6. The `astro` peer dependency is now `^5.0.0 || ^6.0.0`, so Astro 5 consumers continue to work without changes. The package's own test suite and the `examples/astro/visual-editing` reference app (which consumes `@tinacms/astro`) have been bumped to Astro 6 to exercise the new version in CI. The `examples/astro/kitchen-sink` app has also been bumped to keep the kitchen-sink on a current Astro release, though it uses its own integration rather than `@tinacms/astro`.
