---
"@tinacms/mdx": patch
---

Stop writing a hard break that markdown cannot represent where it sits.

Two positions have no representable form, and both used to write a character the author never typed.

**Nothing after it.** A trailing backslash is a hard break in CommonMark only when another line follows it in the same block. With nothing after it, `one\` reads back as a literal backslash: the break is lost and the backslash enters the content as data. The next save escapes it to `one\\`, which is a fixed point — bounded corruption, but the line break is permanently replaced by a visible backslash.

**Raw HTML or an inline template after it.** A break puts its neighbour at the start of a line, where both read differently: `toMarkdown` will not let `<` open a line, so it rewrote the break as `\` plus a space, which comes back as a literal backslash; and an inline element at line start parses as flow, so it was promoted out of its paragraph — or wrote nothing at all when no template matched it, leaving the `\` dangling. A break before raw HTML now becomes a space, which keeps the word separation; before an inline element it is dropped, because an element that writes nothing would leave only trailing whitespace behind.

The last of these bites without the editor: a file already containing `one\` followed by inline HTML was corrupted by opening and saving it, with no edit made.

Whether a break is representable is positional rather than type-based, so the check is a walk over the mdast tree rather than a list of container types. Both the `markdown` and `mdx` serializers use it.

Fixes #5426. Part of #7415.
