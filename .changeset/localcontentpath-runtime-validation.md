---
"@tinacms/schema-tools": patch
"@tinacms/cli": patch
---

Add runtime Zod validation for the `localContentPath` Tina config field (rejects non-string and empty-string values). Extract the CLI's content-root resolution out of `processConfig` into a standalone, unit-testable `resolveContentRootPath` function that preserves the existing behaviour (falls back to `rootPath` with a warning when the configured directory is missing). Closes [tinacms/tinacloud#3294](https://github.com/tinacms/tinacloud/issues/3294).
