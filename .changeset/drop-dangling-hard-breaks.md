---
"@tinacms/mdx": patch
---

Stop writing a hard break that has nothing after it.

A trailing backslash is a hard break in CommonMark only when another line follows it in the same block. With nothing after it, `one\` reads back as a literal backslash: the break is lost and a character the author never typed enters the content as data. The next save escapes that literal to `one\\`, which is a fixed point — bounded corruption, but the author's line break is permanently replaced by a visible backslash.

Whether a break is representable is positional rather than type-based, so the check is a walk over the mdast tree rather than a list of container types. Both the `markdown` and `mdx` serializers use it.

Fixes #5426. Part of #7415.
