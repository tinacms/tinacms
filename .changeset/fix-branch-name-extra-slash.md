---
"tinacms": patch
---

Fix "Save to new branch" failing with "Branch operation failed" when the derived branch name is not a valid Git ref, e.g. when a collection's `path` has a trailing slash, producing `content/articles//foo.mdx` and the invalid ref `tina/articles//foo`. The default branch name derived from the file path, and any user-typed name, are now normalised to a valid ref: repeated and leading/trailing slashes collapse, characters Git forbids in refs (whitespace, control characters, `~ ^ : ? * [ \` and the `@{` sequence) become hyphens, `..` runs collapse, and leading dots and trailing `.` / `.lock` are stripped per path component. Saving is disabled while the name normalises to an empty string.
