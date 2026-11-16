# ADR-025: Form Hook Registration

## Status
**Proposed**, amended by [ADR-028](./028-server-save-hooks.md): a hook may have a server side (§1), and a server hook receives a `session` (§7). Resolves the registration question that [ADR-014](./014-document-lifecycle-hooks.md) left open. ADR-014 defines the three hooks (`onChange`, `beforeSave`, `afterSave`), their power and their client/server split. It does not say how a hook reaches a form. This ADR does. It follows the model that [ADR-016](./016-schema-compiled-artifact.md) and the validation layers in [Field Plugins](./plugins/field-plugins.md#field-level-named-validators) already use for validators.

## Context
The first implementation of ADR-014 in `@tinacms/tinacms` (tinacms/tinacms#7622) registers hooks **per plugin**: a plugin declares `provides: ['hooks']`, puts a `hooks` object on its client segment, and boot collects every plugin's hooks into one flat list. Every hook then runs on every form of every collection, in `config.plugins` order. A hook that only applies to one collection has to test `scope.collection.name` itself.

Reviewing that surfaced three problems:

1. **No opt-in.** The schema does not show which hooks run on a collection. The reader has to open every plugin.
2. **Order is accidental.** Hook order follows `config.plugins`, which the host arranges for other reasons (a media provider before an auth provider, say). ADR-014 asks for "explicit order".
3. **Two mental models.** A validator is a named rule a plugin registers and a field consumes by name. A hook was a global side effect. Both are "plugin code that runs against form data", so one model is enough.

## Decision

### 1. A plugin registers hooks under names
A plugin that provides `hooks` lists the names on its manifest and holds one **factory** for each name on its client segment. This is the validator shape. A factory takes the `args` the collection wrote and returns a `FormHooks` object; any of `onChange`, `beforeSave` and `afterSave` may be absent.

`defineHook` names a hook and types its arguments. It returns the helper a collection calls to build the `HookRef`. `defineHooksPlugin` builds the manifest and the client segment from a list of hooks, so the declared names cannot drift from the factories.

```ts
// tina/hooks.ts
import { defineHook, defineHooksPlugin } from '@tinacms/tinacms';

export const requireStarsToPublish = defineHook('requireStarsToPublish', () => ({
  beforeSave: (document) => {
    if (document.status === 'published' && !document.stars) {
      throw new Error('Rate the post before you publish it');
    }
    return document;
  },
}));

export const logSave = defineHook('logSave', (prefix: string) => ({
  afterSave: (_document, { path }) => console.info(`${prefix} ${path}`),
}));

export const hooksPlugin = defineHooksPlugin('example:hooks', [
  requireStarsToPublish,
  logSave,
]);
```

`defineHooksPlugin` loads the hook bodies with the manifest. A hook that imports browser-only code writes the manifest by hand, which keeps the client segment behind `() => import(...)`:

```ts
// tina/hooks.ts, the long form
import { type HookRef, definePlugin } from '@tinacms/tinacms';
import { type JsonValue, defineClientPlugin } from '@tinacms/tinacms/client';

export const logSave = (prefix: string): HookRef => ({
  name: 'logSave',
  args: [prefix],
});

export const hooksPlugin = definePlugin({
  name: 'example:hooks',
  provides: ['hooks'],
  hooks: ['logSave'],
  client: () => import('./hooks.client'),
});

// tina/hooks.client.ts
export default defineClientPlugin({
  hooks: {
    logSave: (prefix: JsonValue) => ({
      afterSave: (_document, { path }) => console.info(`${String(prefix)} ${path}`),
    }),
  },
});
```

`hooks` is a **Keyed capability** like `validator`: the name is the registry key, it is global, and two plugins that register the same name conflict at boot unless one declares `overrides`. Third-party names take a prefix (`acme.logSave`); first-party names stay bare.

A hook may also have a server side, which runs on the Backend when the document is saved ([ADR-028](./028-server-save-hooks.md)). `defineHook(name, { client, server })` declares both sides. The name is declared once and shared by both sides, and both sides come from the same plugin. `server` is a lazy `() => import('./x.server')`, and the manifest lists the names that have a server side in `serverHooks`. The `defineHook(name, factory)` form above means client only.

### 2. A collection consumes hooks by name
A collection lists the hooks that run on its forms, with their `args`, in the order they run. The reference shape is the validator's: `{ name, args }`, with a typed helper per hook so the config reads as a call.

```ts
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

Installing the plugin registers the names. The collection picks which of them run.

A collection with no `hooks` runs no hooks. There is no global hook list.

### 3. Order is the collection's list
`beforeSave` hooks form the pipeline ADR-014 describes, in the order the collection wrote them. `onChange` and `afterSave` observers run in the same order. `config.plugins` order and `dependsOn` do not affect hook order. This is the "explicit order" ADR-014 asked for, without a numeric `order` field.

### 4. Names are checked at build time
The names live on the manifest, so `compileSchema` checks a collection's `hooks` against the installed plugins without loading client code, in the same pass that checks `validators`. A collection that names a hook no plugin registers fails codegen. The compiled `tina-lock.json` carries the collection's hook list. The runtime composes the name registry at boot and resolves a collection's list to `FormHooks[]` when a form mounts, so each open form gets its own hook instances.

### 5. Hook names follow ADR-014
The edit observer is `onChange`, not `afterEdit`. tinacms/tinacms#6912 used `afterEdit`; the ADR-014 term wins, and the implementation renames it.

### 6. Failure semantics follow ADR-014, with one typed signal
A `beforeSave` throw stops the save; the form stays dirty. `afterSave` and `onChange` are observers: every one runs even when an earlier one throws. An `onChange` failure goes to the console. An `afterSave` failure reaches the caller of `useFormSave` as an `AfterSaveHookError` after the save has landed, so the admin can show "saved, but a hook failed" instead of "not saved". This is the "logged, not rolled back" rule of ADR-014 §2 with a typed error added for the UI.

### 7. The scope a hook receives
A client hook still receives `{ formId, path, collection }` beside its payload. A hook no longer needs `collection` to decide whether to act, but a shared hook (an audit hook on several collections) still needs it for its output.

A server hook receives `{ path, collection, session, branch }`. It has no `formId`, because a server write has no form. `session` is the saving user's `Session`, or `null` without an auth plugin. `branch` is the branch the save names, or `undefined` on the default branch.

## Consequences

### Positive
- The schema is the one place to read what runs on a form. `hooks: [...]` sits beside `fields: [...]`.
- Order is explicit and local to the collection.
- One model for plugin code that runs against form data: register under a name, consume by name, check the name at build time.
- A hook is reusable with arguments (`logSave('saved')`, `logSave('audit')`), the way a validator is. `defineHook` types those arguments, so a wrong one fails the build.
- No `collection.name` checks inside hooks.

### Negative
- A cross-cutting hook (audit every save) must be listed on every collection. A helper that spreads a shared list is the mitigation; a global fallback is not, because it reintroduces the second model.
- One more thing on the collection schema, and one more list for `compileSchema` to check.
- The first implementation (tinacms/tinacms#7622) needs rework: the flat registry becomes a keyed registry, the manifest gains `hooks: string[]`, `CollectionSchema` gains `hooks`, and codegen checks the names.

## Alternatives Considered
- **Global per-plugin hooks (the first implementation)**: *rejected*. Every hook runs everywhere; opt-in and order live inside hook code and `config.plugins`, not in the schema.
- **Field-type scoping (a field plugin's hooks run only on forms that use that field type)**: *rejected*. It helps one case, ties hooks to field plugins, and still leaves non-field hooks global. The collection list covers the case (`hooks: [requireStars()]`) with the same mechanism as everything else.
- **Hooks on a field (`t.string({ hooks })`)**: *rejected*. `onChange` at field level is what `validators` and the field component already cover; `beforeSave` and `afterSave` are document-level events, and a field has no document to return.
- **A numeric `order` on each plugin hook**: *rejected*. ADR-014 mentioned it as a fallback. The collection list is a total order with no numbers to collide.

## References
- [CONTEXT.md](./CONTEXT.md): Document lifecycle hooks, Keyed capability, Collection
- [ADR-014](./014-document-lifecycle-hooks.md), [ADR-016](./016-schema-compiled-artifact.md), [ADR-018](./018-save-flow.md), [ADR-028](./028-server-save-hooks.md)
- [Field Plugins: named validators](./plugins/field-plugins.md#field-level-named-validators)
- tinacms/tinacms#6912 (the issue), tinacms/tinacms#7622 (the first implementation)
