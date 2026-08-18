---
'tinacms': patch
---

Skip TinaCloud identity requests when no auth token is stored. Logged-out admin loads no longer produce misleading 401/CORS console errors; a clear console message now points at the login popup console instead. Also fixes an unawaited auth guard in GetDocument and an unhandled promise rejection when the project settings request fails.
