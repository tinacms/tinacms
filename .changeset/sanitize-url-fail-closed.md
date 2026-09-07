---
'@tinacms/mdx': patch
---

`sanitizeUrl` no longer returns the value it was given when `new URL()` cannot parse it. A value that still names a scheme, including one disguised with a null byte or a zero-width character, now returns an empty string. Relative URLs name no scheme and are kept as they were.
