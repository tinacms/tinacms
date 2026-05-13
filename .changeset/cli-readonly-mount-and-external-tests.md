---
"@tinacms/cli": patch
---

Two follow-ups to the cache-relocation + externalize work:

**Read-only project mounts now fail with an actionable error.**
After moving the build cache from `os.tmpdir()` into the project tree
(`tina/__generated__/.cache/`), users on read-only mounts (Docker `:ro`
volumes, AWS Lambda's `/var/task`, sandboxed CI runners) would otherwise
hit a cryptic `EACCES` from esbuild partway through the first build.
`ConfigManager` now detects the unwritable case at init and throws a
clear error explaining what's wrong and how to resolve it.

**Externalize logic extracted to a tested helper.**
`EXTERNAL_BASELINE` and the user-extension merge from
`build.externalDependencies` now live in `external-resolver.ts` with
unit tests covering: baseline-only, user-extension append, ordering,
empty-list edge case, undefined-config edge case, and the invariant
that the baseline can't be silently dropped via user input.
