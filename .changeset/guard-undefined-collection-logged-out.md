---
'tinacms': patch
---

Fix two admin regressions that appear once the TinaCloud session check starts failing. Making the collection list settle instead of spinning left the previously fetched data in place, so switching collections rendered the last collection's documents under the new collection's heading; on a fresh mount it left `collection` undefined with no error set, so `GetCollection` ran its auto-open effect against it and threw, which the top-level error boundary caught and replaced the admin with a raw TypeError card. A failed session check now sends the user straight back to the login modal with a "Your session has ended" message, and signing back in returns them to the page they were on. `GetCollection` and `GetDocument` also stop handing `undefined` to their children, showing an "Unable to load" popup for non-auth load failures, and `GetCollection`'s auto-open effect bails out early, which clears the same crash on a failed `fetchCollection`.
