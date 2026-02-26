---
"@tinacms/cli": patch
"@tinacms/schema-tools": patch
---

* Restricted CORS on dev server to localhost by default for [GHSA-8pw3-9m7f-q734](https://github.com/tinacms/tinacms/security/advisories/GHSA-8pw3-9m7f-q734).
* Added `server.allowedOrigins` config option for non-localhost environments.
* Enabled Vite `server.fs.strict` with computed allow list for [GHSA-m48g-4wr2-j2h6](https://github.com/tinacms/tinacms/security/advisories/GHSA-m48g-4wr2-j2h6)
* Bind LevelDB TCP server to 127.0.0.1
