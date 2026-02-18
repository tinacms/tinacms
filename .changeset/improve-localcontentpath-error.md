---
'@tinacms/cli': patch
---

Improve error message when content directory is missing a `tina/` folder. When using `localContentPath`, the error now explains that the content directory needs a `tina/` folder for generated files and provides the exact `mkdir` command to fix it, instead of the misleading suggestion to use `--rootPath`.
