---
"@tinacms/schema-tools": patch
"@tinacms/graphql": patch
"tinacms": patch
---

Unify folder-name validation with the document-filename and backend `relativePath` allowlist. The Create Folder modal now rejects names with disallowed characters (e.g. spaces) inline instead of letting the request fail on the backend, and a project-level `folderNameRegex` is layered on top of that baseline. The allowlist lives in a single shared constant in `@tinacms/schema-tools`.
