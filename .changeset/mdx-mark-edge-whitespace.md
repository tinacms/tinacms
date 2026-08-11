---
"@tinacms/mdx": patch
---

Bold, italic and strikethrough now survive a leading or trailing space in the selection. Selecting `word ` and applying bold used to save `**word **`. CommonMark cannot close emphasis that sits against a space, so the published page showed literal asterisks and the formatting was lost, even though the editor still looked right. The space now sits outside the markers, giving `**word** `.

The fix also covers marks holding only whitespace, empty marks, marks spanning several text nodes, marks inside a link, and combined bold and italic. Whitespace inside a mark, as in `**Hello *world*, again**`, still round trips unchanged.
