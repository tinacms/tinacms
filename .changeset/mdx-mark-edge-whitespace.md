---
"@tinacms/mdx": patch
---

Bold, italic and strikethrough now survive a leading or trailing space in the selection. Selecting `word ` and applying bold used to save `**word **`. CommonMark cannot close emphasis that sits against a space, so the published page showed literal asterisks and the formatting was lost, even though the editor still looked right. The space now sits outside the markers, giving `a **word** more`.

Indentation at the start of a line is kept as well. A bare space there is whitespace a Markdown parser may discard, and four of them open an indented code block, so an indented line used to reload without its spaces on the `mdx` parser and as a code block on the `markdown` parser. This applies to the first line of a paragraph and to a line broken with Shift+Enter. The leading space is now written as `&#x20;`, so the text comes back the way it was left.

The fix also covers marks holding only whitespace, empty marks, marks spanning several text nodes, marks inside a link, and combined bold and italic. Whitespace inside a mark, as in `**Hello *world*, again**`, still round trips unchanged.
