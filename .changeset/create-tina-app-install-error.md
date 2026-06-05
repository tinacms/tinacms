---
"create-tina-app": patch
---

Surface the real cause when dependency installation fails. Previously a failed install showed `Failed to install packages: undefined` with no detail; the CLI now captures the package manager's output and reports the exit code and error, including a hint to run `approve-builds` when pnpm has blocked dependency build scripts.
