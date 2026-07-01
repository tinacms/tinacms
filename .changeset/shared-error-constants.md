---
"@tinacms/schema-tools": patch
"@tinacms/graphql": patch
"tinacms": patch
---

refactor: replace hardcoded error-message string checks with shared error-identifier constants in `@tinacms/schema-tools`, so producers and consumers reference one source of truth instead of fragile `error.message.includes('...')` matching (#6777)
