# Plugins

v4 has one type of plugin: a manifest that you give to `definePlugin`. The
capabilities in the `provides` property give the type of the plugin. v4 has no
different functions such as `defineFieldPlugin` or `defineMediaPlugin`.

```ts
// core/plugin.ts
import { definePlugin } from '@tinacms/tinacms';

definePlugin({
  name: 'tina:field:string',     // unique identity
  provides: ['field'],           // capabilities it satisfies
  client: () => import('./string-field.client'),  // lazy client segment
});
```

`definePlugin` is an identity function. It applies the types to the manifest,
then it returns the manifest.

## The manifest

The manifest of a field plugin (`PluginManifest`, `core/plugin.ts`) has three
properties:

| Property | Role |
|---|---|
| `name` | The unique identity. Any string is permitted. The core plugins use the format `tina:<capability>:<key>`. |
| `provides` | The capabilities that the plugin supplies. A field plugin uses `['field']`. |
| `client` | A lazy import of the client segment, which holds the descriptor. |

A field plugin can also have a fourth property, `overrides`. Add `overrides` to
replace a built-in field at a key that is already in use. Refer to
[field-plugins.md](./field-plugins.md#replace-a-built-in-field).

## Capabilities

`Capability` has these values: `'field'`, `'content'`, `'auth'`, `'media'`, and
`'search'`. `field` is a keyed capability. Many field plugins can operate at the
same time, one plugin for each schema `type` such as `string` or `image`.

## More data

- [Field plugins](./field-plugins.md) — how to write a field plugin
  - [The `string` field](./string-field.md) — the text input that v4 supplies
  - [The `boolean` field](./boolean-field.md) — the checkbox that v4 supplies
  - [The `number` field](./number-field.md) — the numeric input that v4 supplies
  - [The `rich-text` field](./rich-text-field.md) — the Plate editor that v4
    supplies, and the markdown body that it controls
- [Architecture](./architecture.md) — how a plugin gets to the screen
