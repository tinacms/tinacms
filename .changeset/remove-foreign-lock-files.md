---
'create-tina-app': patch
---

Scaffolded projects now keep only the lock file for the chosen package manager. Lock files the starter ships for other package managers are deleted before install, so they no longer end up in the project's first commit.
