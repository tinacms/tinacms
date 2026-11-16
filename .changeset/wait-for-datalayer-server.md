---
'@tinacms/cli': patch
---

Wait for the datalayer server to be listening before `tinacms dev`, `build` and `audit` connect to it, and stop the command with an error naming the cause when the server can't start. Previously a listen failure other than a busy port was swallowed, leaving the command stuck on "Indexing local files".
