---
"@tinacms/cli": patch
---

Add support for the `tinacms codemod move-tina-folder` command. This command moves the Tina folder from `.tina` to `tina`, and creates a lock file, which allows the entire `tina/__generated__` folder to be gitignored.
