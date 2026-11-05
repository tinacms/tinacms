---
"@tinacms/astro": patch
---

Use the shared server helpers from `@tinacms/bridge` for edit-mode detection, form payloads, sanitizers, serving `/admin/bridge.js` and the island route. `@tinacms/astro/is-edit-mode` and `@tinacms/astro/sanitize` keep their exports.

`experimental_createIslandRoute` now validates more strictly. The bridge already sends conforming requests, so editing is unaffected:

- The body must be a JSON object of at most 1 MB.
- An unregistered island, including names inherited from `Object.prototype` such as `constructor`, gets a plain `Not Found`.
- A loader or render error gets a 500 without detail.
- Creating the route throws if an island name isn't a URL path segment or a wrapper tag is a void element such as `img`.
