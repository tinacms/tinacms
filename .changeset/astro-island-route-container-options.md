---
'@tinacms/astro': minor
---

`experimental_createIslandRoute` now accepts an optional `containerOptions` argument that is forwarded to `AstroContainer.create`. This lets islands that use a UI framework (React, Vue, Svelte, ...) be rendered in visual editing — the container is created empty and, unlike the page pipeline, does not inherit renderers from the Astro config, so framework islands previously failed to render. Pass `{ containerOptions: { renderers: [...] } }` to register them. Existing callers are unaffected (the argument is optional).
