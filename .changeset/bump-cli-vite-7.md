---
"@tinacms/cli": patch
---

Bump `vite` from `^6.4.3` to `^7.3.6`.

Vite 6 needs esbuild 0.25, and `@tinacms/cli` uses esbuild 0.28 directly, so installs had two esbuild binaries. Vite 7 accepts esbuild 0.28, so the CLI and Vite share one binary.

The `tinacms` binary refuses to start on Node.js older than 22. This matches the Node.js LTS lines that TinaCMS supports, 22 and 24. Vite 7 does not run on Node.js 18. On an older Node.js version, the binary exits with code 1, so a CI build stops instead of skipping `tinacms build`.

The admin build uses the Vite 7 default browser targets: Chrome 107, Edge 107, Firefox 104, and Safari 16. The Vite 6 targets were Chrome 87, Edge 88, Firefox 78, and Safari 14.
