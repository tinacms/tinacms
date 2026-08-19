---
"tinacms": patch
---

Make `shift+Enter` produce a line break that survives a save.

Plate's `SoftBreakPlugin` inserts a literal `\n` into the text node. In markdown a bare newline inside a paragraph is a soft wrap, so serialization re-flowed it into a space and the line break vanished on save. Blockquotes were unaffected because a separate plugin already inserted a `break` element there — hence the inconsistency.

`shift+Enter` now inserts the same `break` element everywhere, which serializes to a `\` hard break and round-trips as a `<br>`:

```md
123 Abc Street\
Town Central, CA\
90210
```

A break in a heading splits the heading, and a break with nothing after it is dropped rather than written as a dangling `\` — both handled in `@tinacms/mdx`, so no container silently eats the break any more.

Two places keep the old behaviour. Code blocks want a real newline. GFM table cells cannot represent a hard break at all, and a literal `<br>` is not a workaround either — `TinaMarkdown` renders `html_inline` escaped, so it shows on the page as the text `<br>`.

`mod+Enter` / `mod+shift+Enter` inside a blockquote also work again; the blockquote handler used to swallow them before `ExitBreakPlugin` could exit the quote.

Fixes #6555 and #7408. Part of #7415.
