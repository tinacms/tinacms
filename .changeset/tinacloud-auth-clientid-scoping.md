---
"@tinacms/auth": patch
"next-tinacms-azure": patch
"@tinacms/cli": patch
---

Security fix: TinaCloud authorization is now scoped to the site's own configured clientID instead of a value read from the request. `isAuthorized` takes an optional `expectedClientID` (falling back to `NEXT_PUBLIC_TINA_CLIENT_ID`) and refuses when neither resolves. `TinaCloudBackendAuthProvider`, the `next-tinacms-azure` adapter, and the `tinacms init` template all pass the site clientID through.

**Action required (self-hosted).** Authorization now fails closed when the site's clientID cannot be resolved at runtime. Ensure `NEXT_PUBLIC_TINA_CLIENT_ID` is present in the server runtime (not only inlined at build time), or pass the clientID explicitly to `TinaCloudBackendAuthProvider(...)` and to media-store `authorized` callbacks, e.g. `isAuthorized(req, process.env.NEXT_PUBLIC_TINA_CLIENT_ID)`. If it cannot be resolved, backend and media authorization will return 401.
