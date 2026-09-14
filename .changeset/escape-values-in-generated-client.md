---
'@tinacms/cli': patch
---

Values written into the generated client are now emitted as JS literals rather than being interpolated between quotes. A branch name that contains a quote, a backslash or a newline is kept as part of the URL string instead of changing the surrounding code. The same applies to the token, the cache directory and the error policy.
