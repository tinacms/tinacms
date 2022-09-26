---
'@tinacms/schema-tools': patch
'@tinacms/toolkit': patch
'tinacms': patch
---

- deprecate: `defaultValue`
- add `defaultItem` to the collection (as a function or an object)
```ts
defaultItem: () => {
  const m = new Date()
  return {
    title: 'New Page',
    test: 'This is a default value of the test field',
    filename: `new-page-${
      m.getUTCFullYear() +
      '-' +
      (m.getUTCMonth() + 1) +
      '-' +
      m.getUTCDate()
    }`,
  }
},
```
- Allow `datetime` field to be undefined or empty
