# Code Generation

> **Canonical sources:** [CONTEXT.md](../CONTEXT.md) (Permission), [ADR-008](../008-authorization-permissions-roles.md); see also [Plugin System](../architecture/plugin-system.md).

Codegen in v4 produces two distinct typed surfaces:

1. **Typed content client** — from the schema in `defineConfig`, like v2. Provides type-safe GraphQL queries against the `content` capability.
2. **Typed `Permission` union** — aggregated from every plugin's declared permissions, so `protectedOp({ permission })` and `requires: { permission }` are typo-safe and autocomplete in the IDE.

Both run at the same step, off the same plugin list.

## Typed content client

### Input

```ts
import { defineConfig, defineCollection, t } from 'tinacms'

export default defineConfig({
  schema: {
    collections: [
      defineCollection({
        name: 'post',
        label: 'Blog Posts',
        path: 'content/posts',
        format: 'mdx',
        fields: [
          t.string({ name: 'title', label: 'Title', required: true }),
          t.richText({ name: 'body', label: 'Body' }),
          t.string({ name: 'author' }),
        ],
      }),
    ],
  },
})
```

### Output

```
tina/
└── __generated__/
    ├── types.ts          # Generated content + field types
    ├── client.ts          # Typed GraphQL client for the `content` capability
    └── permissions.ts     # Typed `Permission` union (see below)
```

### Usage

```ts
import { client } from '../tina/__generated__/client'

const { data } = await client.queries.post({ relativePath: 'hello.mdx' })
// data.post.title: string  (typed from t.string with required: true)
```

## Typed `Permission` union

### Input — plugins declare permissions

```ts
definePlugin({
  name: 's3-media',
  provides: ['media'],
  permissions: [
    { name: 'media:upload', description: 'Upload new media' },
    { name: 'media:delete', description: 'Delete media files' },
  ],
  // …
})
```

Core declares the built-in permissions (`content:publish`, `content:write`, …).

### Output

```ts
// tina/__generated__/permissions.ts
export type Permission =
  | 'content:write'
  | 'content:publish'
  | 'media:upload'
  | 'media:delete'
  | 'search:reindex'
  // … etc, aggregated from every plugin in defineConfig({ plugins })
```

### How it's used

```ts
// In a server segment — type-checked against the generated union
import { protectedOp } from 'tinacms/server'

export default defineServerPlugin({
  delete: protectedOp({ permission: 'media:delete' }, async (input) => { … }),
  //                                ↑ autocompletes; 'media:deleet' is a compile error
})
```

```ts
// In a plugin manifest — also type-checked
definePlugin({
  name: 'editorial-workflow',
  requires: { permission: 'content:publish' },
})
```

```sh
# Discover everything declared
$ tina permissions
content:write       (tinacms core)
content:publish     (tinacms core)
media:upload        (s3-media)
media:delete        (s3-media)
search:reindex      (algolia-search)
```

The CLI lists each permission with its defining plugin. ([ADR-008 §3](../008-authorization-permissions-roles.md))

## When codegen runs

- `tina dev` runs codegen on startup and re-runs on `defineConfig` or plugin manifest changes.
- `tina build` runs codegen as part of the build.
- `tina codegen` runs it once.

Codegen output **must be regenerated when the plugin list changes** because adding a plugin can add new permissions to the union.

## What codegen does *not* do

- **It does not generate the Capability RPC client.** That is typed end-to-end by `import type` from each plugin's server segment — no codegen step, no shared interface file. ([ADR-007](../007-full-stack-plugins-client-backend-segments.md))
- **It does not generate the Zustand store types.** The store type is inferred from the boot-time composition.
- **It does not bundle anything.** It writes types and a small client; bundling is the user's build system.

## Related

- [GraphQL Server (`content` capability)](./graphql-server.md) — the schema codegen runs against
- [ADR-008](../008-authorization-permissions-roles.md) — permissions vocabulary
- [Plugin System](../architecture/plugin-system.md) — where permissions are declared
