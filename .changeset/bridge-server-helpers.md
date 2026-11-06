---
"@tinacms/bridge": minor
---

Add server-side entry points so framework adapters share one implementation instead of keeping their own copies:

- `@tinacms/bridge/edit-mode`: `isEditMode`, `readCookie`, `EDIT_COOKIE`, `EDIT_COOKIE_HEADER`.
- `@tinacms/bridge/form-payload`: `CollectedForm`, `addForm`, `sortByPriority`, `renderFormPayload`, `renderPageFormPayloads`.
- `@tinacms/bridge/island`: `handleIslandRequest`, `assertValidIslands`, `isIslandName`, and the `IslandWrapper`, `IslandRender` and `IslandRequest` types. Adapters pass a `render` callback; the request checks, form payloads and response live here.
- `@tinacms/bridge/sanitize`: `sanitizeHref`, `sanitizeImageSrc`, `sanitizeCssColor`.
- `@tinacms/bridge/dev-server` (Node only): `BRIDGE_ROUTE`, `bridgeBundlePath`, `readBridgeBundle`, `serveBridge`.
