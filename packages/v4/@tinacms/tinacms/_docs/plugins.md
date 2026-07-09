# Plugins

In v4 there is **one** kind of plugin: a manifest passed to `definePlugin`. A
plugin's "kind" is just what it `provides` — there is no separate
`defineFieldPlugin` / `defineMediaPlugin`.

```ts
// core/plugin.ts
import { definePlugin } from '@tinacms/tinacms';

definePlugin({
  name: 'tina:field:string',     // unique identity
  provides: ['field'],           // capabilities it satisfies
  client: () => import('./string-field.client'),  // lazy client segment
});
```

`definePlugin` is the identity function — it types and returns the manifest.

## The manifest

A field plugin's manifest (`PluginManifest`, `core/plugin.ts`) is three fields:

| Field | Role |
|---|---|
| `name` | unique identity (any string); core plugins use `tina:<capability>:<key>` |
| `provides` | declares the capabilities it satisfies — `['field']` |
| `client` | a lazy import of the client segment (which holds the descriptor) |

`overrides` is an optional fourth: declare it to replace a built-in field at an
existing key (see [field-plugins.md](./field-plugins.md#replacing-a-built-in)).

## Capabilities

`Capability` is `'field' | 'content' | 'auth' | 'media' | 'search'`. `field` is
a *keyed* capability: many field plugins coexist, one per schema `type`
(`string`, `image`, …).

## More

- [Field plugins](./field-plugins.md) — how to build one
  - [The `string` field](./string-field.md) — the shipped text input
  - [The `boolean` field](./boolean-field.md) — the shipped checkbox
  - [The `number` field](./number-field.md) — the shipped numeric input
- [Architecture](./architecture.md) — how a plugin reaches the screen
