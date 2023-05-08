---
'@tinacms/schema-tools': patch
'@tinacms/cli': patch
---

Add support for sites deployed to sub-paths. To enabled, provide the sub-path at config.build.subPath:

```ts
  ...
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
    basePath: 'my-site', // site is served at my-domain.com/my-site
  },
  ...
```
