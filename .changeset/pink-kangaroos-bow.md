---
"create-tina-app": patch
---

- Created `Logger` class. Moved all pre-defined styles into `Logger`.
- Moved global variables such as `program` to local space.
- Updated `preRunChecks` to warn the user if they're using a non-supported version of Node.
- Replaced `throw new Error('...')` with `exit(1)` to clean up CLI error outputs.
- Added the ability for the user to `CTRL+C` or `SIGINT` early.
- Added validation on project name to conform with NPM naming standards.
- Added error handling around functions that could throw errors. Previously, many errors were being ignored.
- Added more logs to the CLI tool so the user can remain updated throughout the initialisation process.
- The `name` and `version` field within the generated `package.json` now reflect what was entered by the user.
- Linted files.
