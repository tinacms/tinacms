---
'@tinacms/schema-tools': patch
'tinacms': patch
---

Add `router` property on collections. This replaces the need for using the RouteMapper plugin.

```ts
...
  name: 'post',
  path: 'posts',
  ui: {
    router: ({ document }) => {
      // eg. post items can be previewed at posts/hello-world
      return `/posts/${document._sys.filename}`;
    },
  },
...
```

Add `global` property on collections. This replaces the need for `formifyCallback` in most cases

```ts
...
  name: 'post',
  path: 'posts',
  ui: {
    global: true
  },
...
```
