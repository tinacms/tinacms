---
'@tinacms/schema-tools': patch
'@tinacms/toolkit': patch
'tinacms': patch
---

Provide filename customization API.

```ts
name: 'posts',
path: 'content/posts',
ui: {
     filename: {
        slugify: (values) => mySlugifyFunc(values),
        disabled: true
        // other field props like `label`, `component`, `parse` can still be used too
      }
},
```

If one is using `isTitle` a default slugify function is added that slugifys the title. 
