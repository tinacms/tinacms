---
"@tinacms/cli": patch
---

fix(cli): add absWorkingDir to esbuild calls to prevent Yarn PnP interference

When absWorkingDir is not set, esbuild walks up the directory tree and may detect a `.pnp.cjs` file from a parent Yarn PnP workspace. This causes all module resolution to be routed through PnP, breaking projects that do not use Yarn PnP. Adding `absWorkingDir: process.cwd()` pins the working directory and prevents this auto-detection.
