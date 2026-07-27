---
"@tinacms/app": patch
"tinacms": patch
---

Stop shipping the `monaco-editor` package (~73 MB).

Every import of `monaco-editor` in shipped source was **types-only**. The editor itself has always been fetched from a CDN at runtime by `@monaco-editor/loader`, so the 73 MB installed on every user's disk was never executed — and was a different version (0.31.0) from the one that actually runs (0.55.1, the loader's default).

`monaco-editor` is a *required* peer dependency of `@monaco-editor/react`, and npm 7+ auto-installs required peers, so removing it from our `dependencies` was not enough on its own. `@tinacms/app` now uses `@monaco-editor/loader` directly — the same loader `@monaco-editor/react` wraps, so the CDN and editor version are unchanged — and `monaco-editor` is kept as a devDependency for its types.

The copy of the raw editor in `packages/tinacms` was dead code: nothing imported it, it was not exported, and its `parseMDX`/`stringifyMDX` were stubs returning empty values. The live raw editor lives in `@tinacms/app` and is injected into `tinacms` as the `rawEditor` prop. It has been deleted, letting `tinacms` drop both monaco packages entirely.

No behaviour change: raw MDX mode still loads the same editor from the same CDN.
