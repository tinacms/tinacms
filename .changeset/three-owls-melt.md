---
'@tinacms/graphql': patch
---

Generated client now resolves references. The default depth is 5 and can be modified in the `config` section of `defineSchema`.

EX

```ts
const schema = defineSchema({
    config: {
        client: {
            referenceDepth: 3
        },
    }
    // ...
})
```

To get the old behaver set referenceDepth to `1`.

```ts
const schema = defineSchema({
    config: {
        client: {
            referenceDepth: 1
        },
    }
    // ...
})
```