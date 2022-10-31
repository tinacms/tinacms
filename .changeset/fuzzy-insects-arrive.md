---
'@tinacms/schema-tools': patch
'tinacms': patch
---

Adds the ability to hide the delete and create buttons.

EX,

```ts
export default defineConfig({
  collections: [
    {
      label: "Global",
      name: "global",
      path: "content/global",
      ui: {
        global: true,
        allowedActions: {
          create: false,
          delete: false,
        },
      },
      format: "json",
      fields: [
        //...
      ],
    },
  ],
});
```


