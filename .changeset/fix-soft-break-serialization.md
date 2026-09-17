---
"@tinacms/mdx": patch
---

Fix Shift+Enter (soft break) not serializing as a Markdown hard break.

The SoftBreakPlugin inserts a literal `\n` into the text node's `.text` string rather than a separate `{ type: 'break' }` node. The MDX serializer now splits embedded newlines into proper `{ type: 'break' }` mdast nodes so `mdast-util-to-markdown` emits the correct backslash hard break syntax (`\` at end of line).
