---
"tinacms": patch
---

Fix soft returns (`shift+Enter`) being dropped outside blockquotes in the rich-text editor.

Plate's `SoftBreakPlugin` inserts a literal `\n` into the text node. In markdown a bare newline inside a paragraph is a soft wrap, so serialization re-flowed it into a space and the line break vanished on save. Blockquotes were unaffected because a separate plugin already inserted a `break` element there — hence the inconsistency.

`shift+Enter` now inserts the same `break` element everywhere, which serializes to a `\` hard break and round-trips as a `<br>`:

```md
123 Abc Street\
Town Central, CA\
90210
```

Two places keep the old behaviour: code blocks (which want a real newline) and GFM table cells (which cannot represent a hard break — put a literal `<br>` in the cell instead).

`mod+Enter` / `mod+shift+enter` inside a blockquote also work again; the blockquote handler used to swallow them before `ExitBreakPlugin` could exit the quote.
