---
"@tinacms/cli": patch
"@tinacms/scripts": patch
---

Bump `vite` off the EOL 4.x line (`^4.5.9`, resolving to the last-ever `4.5.14`) to `^6.4.3`, and `@vitejs/plugin-react` 3 → 4, closing several path-traversal / file-disclosure advisories that were never backported to vite 4.x.

**Dev server:** Vite 6 serves its dev endpoints (`@vite/client`, `@react-refresh`, and the SPA entry) under the configured `base` — Vite 4 served them at the server root. The injected dev HTML now prefixes those URLs with the admin base path, so `tinacms dev` loads the editor again instead of failing with "Failed loading TinaCMS assets".

**esbuild:** the `esbuild` catalog pin moves `^0.24.2` → `^0.25.0` to match the version vite 6 bundles, so `@tinacms/cli` installs a single esbuild native binary instead of two.

**Other fallout from the majors:** `@vitejs/plugin-react` 4 removed the `fastRefresh` option, so Fast Refresh is now always on in `tinacms dev` (it had been explicitly disabled) — if editor HMR misbehaves, that's the knob that changed. `splitVendorChunkPlugin`, removed in Vite 5, is dropped from the build config (Rollup vendor-splits automatically now). The `process.env` define switches from a `new Object(...)` wrapper to a plain JSON literal, since esbuild ≥0.25 (bundled by vite 6) rejects the old form. The Node.js floor for the `tinacms` binary rises from 14.18 to 18, matching vite 6's engine requirement.
