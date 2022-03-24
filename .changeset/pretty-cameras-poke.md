---
'tinacms': patch
---

With the rich-text editor, inserting a soft-break (`shift+enter`), this will now result in a `<br>` tag being inserted. Note that this will save the markdown with a backslash to indicate line break (instead of multiple empty spaces):

```markdown
123 Abc St\
Charlottetown, PEI
```
