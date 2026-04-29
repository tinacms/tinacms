---
"create-tina-app": patch
---

Resolve template branch from package config instead of the GitHub REST API. The previous behaviour issued an unauthenticated `GET api.github.com/repos/<owner>/<name>` per install solely to discover each starter's default branch, which made high-concurrency installs (notably the scheduled starter-template build matrix) prone to rate-limit failures surfaced as a generic "Repository information not found." error. Each starter now declares its branch in `templates.ts`, so scaffolding only hits `codeload.github.com` for the tarball download.
