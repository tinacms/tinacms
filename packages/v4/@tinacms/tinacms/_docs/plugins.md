# Plugins

v4 has one type of plugin: a manifest that you give to `definePlugin`. The
capabilities in the `provides` property give the type of the plugin. v4 has no
different functions such as `defineFieldPlugin` or `defineMediaPlugin`.

```ts
// core/plugin.ts
import { definePlugin } from '@tinacms/tinacms';

definePlugin({
  name: 'tina:field:string',                       // unique identity
  provides: ['field'],                              // capabilities it satisfies
  field: { type: 'string', contractVersion: 1 },    // the field it provides
  client: () => import('./string-field.client'),    // lazy client segment
});
```

`definePlugin` is an identity function. It applies the types to the manifest,
then it returns the manifest.

## The manifest

The manifest of a field plugin (`PluginManifest`, `core/plugin.ts`) has four
properties:

| Property | Role |
|---|---|
| `name` | The unique identity. Any string is permitted. The core plugins use the format `tina:<capability>:<key>`. |
| `provides` | The capabilities that the plugin supplies. A field plugin uses `['field']`. |
| `field` | The field provision: `{ type, contractVersion }`. `type` is the schema type this plugin owns and the registry key. `contractVersion` is a number that the codegen lock file records for that type (`codegen/compile-schema.ts`). |
| `client` | A lazy import of the client segment, which holds the descriptor. |

A field plugin needs `field`. Without it, the registry throws
`field-plugin-no-provision` (`core/field/registry.ts`) as soon as it finds a
field descriptor in the client segment. `type` lives here, on the manifest —
not on the descriptor. Refer to
[field-plugins.md](./field-plugins.md#2-the-client-segment-and-the-descriptor-clienttsx).

A field plugin can also have a fifth property, `overrides`. Add `overrides` to
replace a built-in field at a key that is already in use. Refer to
[field-plugins.md](./field-plugins.md#replace-a-built-in-field).

## Capabilities

`Capability` has these values: `'field'`, `'validator'`, `'content'`, `'auth'`,
`'media'`, and `'search'`. `field` and `validator` are keyed capabilities. Many
field plugins can operate at the same time, one plugin for each schema `type`
such as `string` or `image`. Many validator plugins can operate at the same
time, and one plugin can register many validators; the key is the validator's
name.

## Validator plugins

A validator plugin registers named, parameterised rules that a collection
attaches to individual fields. The manifest lists the names in `validators`,
so `compileSchema` can check a collection without loading client code. The
client segment holds one factory for each name. A name that the manifest lists
without a factory, or a factory the manifest does not list, throws at boot.

```ts
// manifest
definePlugin({
  name: 'acme:validators',
  provides: ['validator'],
  validators: ['after'],
  client: () => import('./validators.client'),
});

// validators.client.ts
export default defineClientPlugin({
  validators: {
    after:
      (other) =>
      (value, { siblings }) =>
        typeof value === 'string' &&
        typeof siblings[String(other)] === 'string' &&
        value <= siblings[String(other)]
          ? `Must be after ${other}`
          : null,
  },
});

// in a collection
t.datetime({ name: 'endDate', validators: [{ name: 'after', args: ['startDate'] }] });
```

Two plugins that register the same name are a conflict. Declare
`overrides: [{ capability: 'validator', key: 'after' }]` to replace one.
Refer to [Validation in three layers](./field-plugins.md#validation-in-three-layers)
for the context a rule receives and the order the layers run in.

## More data

- [Field plugins](./field-plugins.md) — how to write a field plugin
  - [The `string` field](./string-field.md) — the text input that v4 supplies
  - [The `boolean` field](./boolean-field.md) — the checkbox that v4 supplies
  - [The `number` field](./number-field.md) — the numeric input that v4 supplies
  - [The `datetime` field](./datetime-field.md) — the datetime-local input that
    v4 supplies
  - [The `array` field](./array-field.md) — the repeatable field that v4 supplies
  - [The `object` field](./object-field.md) — the field group that v4 supplies
  - [The `select` field](./select-field.md) — the fixed-option picker that v4
    supplies
  - [The `reference` field](./reference-field.md) — the document picker that v4
    supplies
  - [The `rich-text` field](./rich-text-field.md) — the Plate editor that v4
    supplies, and the markdown body that it controls
- [Architecture](./architecture.md) — how a plugin gets to the screen
