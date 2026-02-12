---
"@tinacms/graphql": patch
---

GraphQL - Security improvement to the GraphQL resolver to ensure that path traversal sequences (e.g., `../`) in document and folder operations are correctly validated and restricted to the collection's root directory. This prevents unauthorized file operations outside of a collection's configured path.
