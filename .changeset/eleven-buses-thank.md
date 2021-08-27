---
'@tinacms/toolkit': patch
---

Tina toolkit sometimes uses the "path" module, which presumably was built-in with the previous build script logic. It's now listed explicitly as a package dependency
