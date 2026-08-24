---
'tinacms': patch
---

Fix two admin regressions that appear once the TinaCloud session check starts failing. Making the collection list settle instead of spinning left the previously fetched data in place, so switching collections rendered the last collection's documents under the new collection's heading; on a fresh mount it left `collection` undefined with no error set, so `GetCollection` ran its auto-open effect against it and threw, which the top-level error boundary caught and replaced the admin with a raw TypeError card. The hooks now clear the collection and document when the session check fails, and `GetCollection` and `GetDocument` render the error screen rather than handing `undefined` to their children. `GetCollection`'s auto-open effect also bails out early, which clears the same crash on a failed `fetchCollection`.
