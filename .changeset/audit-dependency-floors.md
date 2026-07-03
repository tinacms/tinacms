---
"@tinacms/cli": patch
"@tinacms/scripts": patch
"@tinacms/graphql": patch
"@tinacms/mdx": patch
"tinacms": patch
"create-tina-app": patch
"next-tinacms-cloudinary": patch
---

Resolve all `pnpm audit --prod` advisories affecting the published packages. Direct bumps: vite 4 → 6 in `@tinacms/cli` and `@tinacms/scripts` (with `@vitejs/plugin-react` 3 → 4 and esbuild 0.24 → 0.28), tar 7.4.0 → ^7.5.16 in `create-tina-app`, cloudinary 1.x → 2.x in `next-tinacms-cloudinary`, plus mermaid/posthog/systeminformation minors. Removed the unused `react-use` dependency from `tinacms` (dropped its vulnerable `js-cookie` chain). Workspace `overrides` add same-major security floors for transitive deps pinned by stale parents (qs, path-to-regexp, fast-xml-parser, immutable, js-yaml, lodash, markdown-it, and others). Note: `@vitejs/plugin-react` 4 removed the `fastRefresh` option, so Fast Refresh is now always on in `tinacms dev` (it was explicitly disabled since #5744); if editor HMR misbehaves, that is the knob that changed.
