---
"@tinacms/cli": patch
---

When `tinacms build` stops on a failed TinaCloud index, print the reason TinaCloud gives, such as the YAML error behind "Unable to seed", instead of only the file name or the word "undefined".
