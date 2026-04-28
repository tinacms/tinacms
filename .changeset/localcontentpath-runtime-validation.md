---
"@tinacms/schema-tools": patch
"@tinacms/cli": patch
---

Add runtime Zod validation for the `localContentPath` Tina config field (rejects non-string and empty-string values) in the CLI's content-root resolver. Extract content-root resolution out of `processConfig` into a standalone, unit-testable `resolveContentRootPath` function that preserves existing behaviour (falls back to `rootPath` with a warning when the configured directory is missing). `localContentPath` is deliberately excluded from `tinaConfigZod` so it does not leak into the hashed `_schema.json` and break the server-schema match check for projects that set it. Closes [tinacms/tinacloud#3294](https://github.com/tinacms/tinacloud/issues/3294).
