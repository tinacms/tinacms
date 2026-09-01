---
'@tinacms/schema-tools': patch
---

`AuthProvider` gains an optional `sessionExpiredListener`, invoked when a tokened `fetchWithToken` request comes back 401 so the CMS can return the user to login. The Tina client wires it automatically; custom auth providers can opt in.
