---
"@tinacms/graphql": patch
"@tinacms/cli": patch
"tinacms": patch
---

- Improved error handling for file and folder operations: errors are now shown as clear notifications in the UI rather than just logging to the console.
- Fixed an issue where renaming a document to an already existing filename would silently fail; this now correctly triggers an error alert in the UI.
