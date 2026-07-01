---
"@tinacms/auth": patch
"next-tinacms-azure": patch
"@tinacms/cli": patch
---

Validate the TinaCloud token against the site's own configured clientID instead of one read from the request. `isAuthorized` takes an optional `expectedClientID` (falling back to `NEXT_PUBLIC_TINA_CLIENT_ID`) and refuses when it can't be resolved. `TinaCloudBackendAuthProvider`, the `next-tinacms-azure` adapter, and the `tinacms init` template all pass the site clientID through.

Self-hosted sites should set `NEXT_PUBLIC_TINA_CLIENT_ID` on the server, or pass the clientID explicitly to `TinaCloudBackendAuthProvider(...)` and media-store `authorized` callbacks.
