---
"@tinacms/toolkit": patch
---

Don't allow "tabbing" for rich-text. Tabs in markdown represent code blocks, so this isn't something we want to support.

Fixes bug where "reset" wasn't working for rich text.
