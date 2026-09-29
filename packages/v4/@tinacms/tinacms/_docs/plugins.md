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

`Capability` has these values: `'field'`, `'validator'`, `'hooks'`, `'content'`,
`'auth'`, `'media'`, and `'search'`. `field`, `validator` and `hooks` are keyed
capabilities. Many field plugins can operate at the same time, one plugin for
each schema `type` such as `string` or `image`. Many validator plugins can
operate at the same time, and one plugin can register many validators; the key
is the validator's name. Many hook plugins can operate at the same time, and
one plugin can register many hooks; the key is the hook's name.

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

### Names are global, so give them a prefix

The registry key is the validator name alone, not the plugin name. Two plugins
that register `after` are a conflict, and the second one throws at boot. Give
each name a prefix that is unique to the plugin, in the same way that a plugin
name does:

```ts
validators: ['acme.after', 'acme.matches'];
```

A first-party validator that v4 supplies uses a bare name, such as `after`.

Declare `overrides: [{ capability: 'validator', key: 'after' }]` to replace a
name on purpose.
Refer to [Validation in two layers](./field-plugins.md#validation-in-two-layers)
for the context a rule receives and the order the layers run in.

## Form hook plugins

A form hook plugin registers named hooks that a collection attaches to its
forms. The manifest lists the names in `hooks`, so `compileSchema` can check
a collection without loading client code. The client segment holds one
factory for each name. A factory takes the `args` the collection wrote and
returns the hooks to run. Every hook is optional.

```ts
// tina/hooks.ts
import { defineHook, defineHooksPlugin } from '@tinacms/tinacms';

export const requireStarsToPublish = defineHook(
  'requireStarsToPublish',
  () => ({
    beforeSave: (document) => {
      if (document.status === 'published' && !document.stars) {
        throw new Error('Rate the post before you publish it');
      }
      return document;
    },
  })
);

export const logSave = defineHook('logSave', (prefix: string) => ({
  afterSave: (_document, { path }) => {
    console.info(`${prefix} ${path}`);
  },
}));

export const hooksPlugin = defineHooksPlugin('example:hooks', [
  requireStarsToPublish,
  logSave,
]);

// tina/config.ts
import { hooksPlugin, logSave, requireStarsToPublish } from './hooks';

export default defineConfig({
  plugins: [localContentPlugin(), hooksPlugin],
  schema: { collections: [postCollection] },
});

export const postCollection = {
  name: 'post',
  hooks: [requireStarsToPublish(), logSave('saved')],
  fields: [...],
};
```

`defineHook` names a hook and types its arguments. The helper it returns
builds the `HookRef` a collection lists. `defineHooksPlugin` builds the
manifest and the client segment from a list of hooks. It loads the hook
bodies with the manifest, so a hook that imports browser-only code uses the
long form.

### The long form

```ts
// tina/hooks.ts
import { type HookRef, definePlugin } from '@tinacms/tinacms';
import { type JsonValue, defineClientPlugin } from '@tinacms/tinacms/client';

export const requireStarsToPublish = (): HookRef => ({ name: 'requireStarsToPublish' });
export const logSave = (prefix: string): HookRef => ({ name: 'logSave', args: [prefix] });

export const hooksPlugin = definePlugin({
  name: 'example:hooks',
  provides: ['hooks'],
  hooks: ['requireStarsToPublish', 'logSave'],
  client: async () => ({
    default: defineClientPlugin({
      hooks: {
        requireStarsToPublish: () => ({
          beforeSave: (document) => {
            if (document.status === 'published' && !document.stars) {
              throw new Error('Rate the post before you publish it');
            }
            return document;
          },
        }),
        logSave: (prefix: JsonValue) => ({
          afterSave: (_document, { path }) => console.info(`${String(prefix)} ${path}`),
        }),
      },
    }),
  }),
});
```

The long form keeps the client segment behind `() => import(...)`, the same
as a field plugin.

| Hook | Runs | Receives | Returns |
|---|---|---|---|
| `beforeSave` | after validation passes, before `onSave` | the digested document | the document to save, or a Promise of it |
| `afterSave` | after `onSave` resolves and the form is clean | the saved document | `void` or a Promise |
| `onChange` | on every field value change | `{ address, value }` of the changed field; `value` is the form value, not the stored one | `void`, synchronously |

Every hook also receives a scope: `{ formId, path, collection }`.

These hooks run in the browser. A `beforeSave` throw stops the save in the
form only. A direct call to the content API does not run it. Enforcement
belongs in the server segment (ADR-014 §3), which v4 does not supply yet.

A collection runs the hooks it lists, in the order it lists them. A
collection with no `hooks` runs no hooks. `config.plugins` order and
`dependsOn` do not change hook order.

The form does not show a change that a `beforeSave` hook makes. The form
keeps the values the editor typed until the host loads the saved document
again. A key that the collection does not declare does not go through
`serialize`.

`beforeSave` hooks form a pipeline. Each one receives the document the
previous one returned. A hook that throws stops the save. `onSave` does not
run. The form stays dirty. A throw from `afterSave` reaches the caller of
`useFormSave` as an `AfterSaveHookError`. The save has already landed. A
throw from `onChange` goes to the console. The next hook still runs.
TinaCMS does not await an `onChange` hook.

Names are global, so a third-party plugin gives them a prefix
(`acme.logSave`). Declare `overrides: [{ capability: 'hooks', key }]` to
replace a name on purpose. Refer to
[ADR-025](https://github.com/tinacms/tinacmsv4-docs/blob/main/adr/025-form-hook-registration.md)
for the decision.

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
