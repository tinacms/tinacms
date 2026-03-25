---
"@tinacms/graphql": patch
---

Fix path traversal bypass via backslash sequences

On POSIX systems, path.normalize() treats backslashes as literal characters, not directory separators. This allowed attackers to bypass the existing path traversal checks using paths like x\..\..\package.json — the validation saw no traversal, but downstream path.join()/fs operations could resolve the backslashes as separators.

Fixes GHSA-v9p7-gf3q-h779
