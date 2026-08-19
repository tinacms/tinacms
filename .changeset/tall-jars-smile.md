---
'tinacms': patch
---

Fix the collection list and collection search hanging on the loading screen when the session check says the user is not signed in. Both now settle and render instead of spinning until the page is reloaded.
