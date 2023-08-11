---
'@tinacms/schema-tools': patch
'tinacms': patch
---

Update the router function to work asynchronously. This means that a user can now fetch data or perform other async operations in the router function.

Example:
```ts
 router: async ({ document }) => {
  const res = await client.queries.post({
    relativePath: document._sys.relativePath,
  })
  return `/posts/${res.data.slug}`
},
```
