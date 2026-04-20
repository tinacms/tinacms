---
"@tinacms/scripts": patch
"tinacms-authjs": patch
---

Fix: externalise peer dependency sub-paths (e.g. `react/jsx-runtime`, `next-auth/react`) in the Vite/Rollup build path

Rollup's string-array `external` option only matches exact module IDs — so listing `"react"` in peer deps did NOT externalise `"react/jsx-runtime"`, causing React's JSX runtime to be inlined into package bundles. When the monorepo's React dep was bumped to 19, that inlined copy was compiled against React 19 internals and broke consumers still on React 18 with "Failed loading TinaCMS assets".

The fix: the browser-target build now uses a predicate that externalises both the exact dep name AND any sub-path (`id === dep || id.startsWith(dep + "/")`), matching esbuild's default behaviour.

Visible effect on `tinacms-authjs@21.0.2`:
- `dist/tinacms.js`: 98 KB → 4.4 KB (no more inlined `react/jsx-runtime`, `next-auth/react`, or Babel helpers)
- The bundle no longer carries assumptions about which React version the monorepo was on

Other packages using `@tinacms/scripts` (tinacms-clerk, @tinacms/vercel-previews, next-tinacms-*, etc.) also get tighter bundles where they previously inlined sub-paths of peer deps.
