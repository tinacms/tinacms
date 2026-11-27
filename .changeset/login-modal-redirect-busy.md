---
'tinacms': patch
---

Keep the TinaCloud login modal open with the Log in button busy while the browser redirects to sign in. Before, the modal closed and came back with an idle button until the sign-in page loaded. The site's `onLogin` hook no longer runs before the redirect without a token. It now runs once after the redirect login with the real token, and if it throws, the login is dropped and the error shows in the modal. `TinaCloudAuthProvider.authenticate()` now resolves to an internal marker on the redirect path, where it used to resolve to `undefined`.
