---
'@tinacms/app': patch
'@tinacms/cli': patch
'@tinacms/datalayer': patch
'@tinacms/graphql': patch
'@tinacms/schema-tools': patch
---

Support remote path configuration for separate content repos

Tina now supports serving content from a separate Git repo.

### Local development workflow

To enable this during local development, point
this config at the root of the content repo.

> NOTE: Relative paths are fine to use here, but make sure it's relative to the `.tina/config` file

```ts
localContentPath: process.env.REMOTE_ROOT_PATH // eg. '../../my-content-repo'
```

### Production workflow

For production, your config should use the `clientId`, `branch`, and `token` values that are associated with your _content repo_.

