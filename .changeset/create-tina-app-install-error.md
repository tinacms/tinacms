---
"create-tina-app": patch
---

Surface the real cause when dependency installation fails. Previously a failed install showed `Failed to install packages: undefined` with no detail; the CLI now captures the package manager's output, reports the exit code and error, and links to the FAQ for help.
