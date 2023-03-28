---
'tinacms': patch
---

If you have a collection with 

```ts
ui: {
  allowedActions: {
    create: false,
    delete: false,
  }
},
```

and it only contains one document. Instead of navigating to the collection list page it will navigate to the document edit page.


