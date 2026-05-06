---
"@tinacms/cli": patch
---

Warn when a project still uses the legacy `.tina/` config folder. `tina-lock.json` is only generated for the new `tina/` layout, and TinaCloud requires it to index the schema, so projects on the legacy layout were silently failing the Project Setup Checklist. The warning fires once per CLI run from `dev`, `build`, and any other command that loads the config.
