---
'tinacms': patch
---

Fix the admin crashing with `Cannot read properties of undefined` when the TinaCloud session check says the user is not signed in. Making the collection list settle instead of spinning left `collection` undefined with no error set, so `GetCollection` ran its auto-open effect against it and threw from a passive effect, unmounting the admin. `GetCollection` and `GetDocument` now guard the undefined case and render the error screen instead of handing `undefined` to their children, which also clears the same crash on a failed `fetchCollection`.
