---
'next-tinacms-cloudinary': minor
'tinacms': minor
---


Cloudinary media store now serves images over `https` by default. This can now be configured though the handler provided.

To revert to the old behavior:

```ts
export default createMediaHandler(
  {
    // ...
  },
  {
    useHttps: false,
  }
);
```

The default for `useHttps` is `true`