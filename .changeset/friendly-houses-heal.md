---
'@tinacms/graphql': patch
---

tina folder is default in createDatabase function. If the .tina folder is still being used then `tinaDirectory: '.tina'`, must be added to the createDatabase function.
