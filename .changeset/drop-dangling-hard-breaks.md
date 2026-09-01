---
"@tinacms/mdx": patch
---

Stop writing a hard break where markdown cannot represent one. `one\` with nothing after it, or a break before raw HTML or an inline template, came back as a literal backslash the author never typed. Fixes #5426. Part of #7415.
