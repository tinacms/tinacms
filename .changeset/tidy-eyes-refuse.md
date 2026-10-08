---
'@tinacms/graphql': patch
---

Fix an intermittent, silent hang at "Indexing local files" in `tinacms dev`/`build`/`audit`. `TinaLevelClient.openConnection` connected to the in-process datalayer server without waiting for the server's `listen()` to complete; when the connection lost that race, `many-level` queued every database operation forever with no error. The connection is now retried (100 ms × 50), and if it ultimately fails the RPC stream is destroyed so queued operations reject with `LEVEL_CONNECTION_LOST` instead of hanging. The race is timing-sensitive: on Node 25 it was lost almost every run, on Node 22 occasionally.
