---
"@tinacms/cli": patch
---

Build command - Now reports branch information in output
Reports which branch is being used during a build.
If that branch is a "bot" branch e.g. dependabot updating packages, the project's default branch will be reported as being used
This also improves error handling in the build command
Full error information is available with the `--verbose` flag and not outputted by default
