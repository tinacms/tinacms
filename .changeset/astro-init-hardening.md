---
'@tinacms/cli': patch
---

Harden Astro init (review feedback): skip the visual-editing demo during Forestry migrations (the migrated schema has no `post` collection the demo queries), pin `@astrojs/node` to the project's Astro major (the unversioned adapter only peers the latest Astro, breaking existing Astro 5 projects), and require both `react` and `react-dom` before skipping the matched-React install.
