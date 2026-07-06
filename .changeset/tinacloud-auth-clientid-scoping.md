---
"@tinacms/auth": patch
"next-tinacms-azure": patch
"@tinacms/cli": patch
---

Security fix: validate the TinaCloud token against the site's own configured clientID instead of one read from the request. Previously `isAuthorized` trusted `req.query.clientID`, so a token valid for any TinaCloud app could authorize against a self-hosted site it had no access to. `isAuthorized` now takes an optional `expectedClientID` (falling back to `NEXT_PUBLIC_TINA_CLIENT_ID`) and refuses when neither resolves. `TinaCloudBackendAuthProvider`, the `next-tinacms-azure` adapter, and the `tinacms init` template all pass the site clientID through.

**Action required (self-hosted).** Authorization now fails closed when the site's clientID cannot be resolved at request time. Ensure `NEXT_PUBLIC_TINA_CLIENT_ID` is present in the server runtime (not only inlined at build time), or pass the clientID explicitly to `TinaCloudBackendAuthProvider(...)` and to media-store `authorized` callbacks, e.g. `isAuthorized(req, process.env.NEXT_PUBLIC_TINA_CLIENT_ID)`. If it cannot be resolved, all backend and media authorization will return 401.
