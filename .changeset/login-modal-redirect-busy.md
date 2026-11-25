---
'tinacms': patch
---

Keep the TinaCloud login modal open with the Log in button busy while the browser redirects to sign in. Before, the modal closed and came back with an idle button until the sign-in page loaded. The site's `onLogin` hook now also runs after the redirect login, with the real token.
