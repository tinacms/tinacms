---
'@tinacms/graphql': patch
'@tinacms/schema-tools': patch
---

Added feature where you can merge the content with its existing content.

### How to enable

```ts
// .tina/config

export default defineConfig({
    gql: {
        mergeUpdates: true
    }
})

```