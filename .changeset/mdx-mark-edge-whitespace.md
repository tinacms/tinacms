---
"@tinacms/mdx": patch
---

Bold, italic and strikethrough now survive a leading or trailing space in the selection. Selecting `word ` and applying bold used to save `**word **`. CommonMark cannot close emphasis that sits against a space, so the published page showed literal asterisks and the formatting was lost, even though the editor still looked right. The space now sits outside the markers, giving `a **word** more`.

Indentation at the start of a wrapped line is kept as well. A line broken with Shift+Enter and then indented used to reload without its spaces, since a bare space at the start of a line is whitespace a Markdown parser may discard. It is now written as `&#x20;`, so the text comes back the way it was left.

The fix also covers marks holding only whitespace, empty marks, marks spanning several text nodes, marks inside a link, and combined bold and italic. Whitespace inside a mark, as in `**Hello *world*, again**`, still round trips unchanged.
