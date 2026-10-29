# Field Plugins

> **Canonical sources:** [ADR-009](../009-field-plugins.md) (keyed capability, delegation, addressing), [ADR-010](../010-form-state-model.md) (flat form state); [CONTEXT.md](../CONTEXT.md) for **Field plugin**, **Keyed capability**, **Component resolution**, **Field address**, **Embedded field**, **Form**.

## The model

A field plugin provides the `field` capability **at a key**. The key is the schema field `type` it renders.

```ts
import { definePlugin } from 'tinacms'

definePlugin({
  name: 'string-field',
  provides: ['field'],                  // capability
  // implied key from the segment; the client segment declares which `type` it owns
  client: () => import('./client'),
  // optional: validation/parse/format that needs to run server-side
  server: () => import('./server'),
})
```

The client segment is what actually owns a key:

```ts
// client.ts
import { defineClientPlugin } from 'tinacms'

export default defineClientPlugin({
  field: {
    type: 'string',                     // ← key for the `field` capability
    Component: StringField,
    defaultValue: '',
    metadata: { layout: 'inline' },     // declared metadata, read by composites
  },
})
```

`field` is a **Keyed capability**: many providers coexist (one per `type`). The **Capability conflict** rule applies *per key* — two `field` providers at `type: 'string'` is the error, and `overrides: [{ capability: 'field', key: 'string' }]` is how you intentionally replace a built-in. ([ADR-009 §1](../009-field-plugins.md))

## What a field component gets

A field component receives *only* its **Field address** via context. Everything else is pulled through address-keyed hooks:

```tsx
import { useFieldValue, useFieldErrors, useFieldActivation, useFieldAddress } from 'tinacms/react'

function StringField() {
  const address = useFieldAddress()
  const [value, setValue] = useFieldValue<string>(address)
  const errors = useFieldErrors(address)
  const inputRef = useRef<HTMLInputElement>(null)

  // Opt into focusing when this field becomes the active field
  useFieldActivation(() => inputRef.current?.focus())

  return (
    <div>
      <input
        ref={inputRef}
        value={value ?? ''}
        onChange={(e) => setValue(e.target.value)}
      />
      {errors.map((e) => <span key={e} className="error">{e}</span>)}
    </div>
  )
}
```

Why no value/onChange props? Because forms are **flat, normalized by address** ([ADR-010](../010-form-state-model.md)): a leaf hook is an O(1) Zustand selector subscription that returns a stable reference. Threading value/onChange through React props would force the whole composite tree to re-render on every keystroke.

### What address-keyed hooks exist

| Hook | Subscription | Use case |
|---|---|---|
| `useFieldAddress()` | — | identity of *this* field |
| `useFieldValue<T>(address)` | one leaf address | read+write a value |
| `useFieldErrors(address)` | errors at an address | display validation |
| `useFieldActivation(handler)` | active-field === my address | opt-in focus/popover/center |
| `useSiblingValue(address, name)` | sibling leaf | conditional UI across fields (not validation: see [Validation](#validation)) |
| `useChildKeys(address)` | structure index entry | composite child ordering |

There is **no event bus and nothing "fires" hooks** — every hook is a selector subscription. ([ADR-010 §4](../010-form-state-model.md))

## Composite fields: delegation, never type-branching

A composite field (`object`, `list`, rich-text) **never branches on a child's type**. It delegates child rendering through **Component resolution**:

```tsx
import { Field, useChildKeys, useFieldAddress, useFormActions } from 'tinacms/react'

function ListField() {
  const address = useFieldAddress()
  const childKeys = useChildKeys(address)            // ordered list of stable per-item keys
  const { addItem, removeItem, moveItem } = useFormActions()

  return (
    <div>
      {childKeys.map((key) => (
        <div key={key}>
          {/* delegate — no `if (type === ...)` here */}
          <Field address={`${address}.${key}`} />
          <button onClick={() => removeItem(address, key)}>Remove</button>
        </div>
      ))}
      <button onClick={() => addItem(address)}>Add</button>
    </div>
  )
}

export default defineClientPlugin({
  field: { type: 'list', Component: ListField, metadata: { layout: 'block' } },
})
```

What this buys you:

- **Adding a new field type touches zero lines of any composite.** The 1,000-line `if (child.type === 'string') … else if … else if (rich-text)` ladder is *impossible to write* under delegation.
- **A composite is itself just a field plugin.** There is no privileged "container" concept.
- **Layout decisions read child metadata**, not child types. If a composite needs to know whether a child renders inline or as a block, the child *declares* that in `metadata.layout` — the composite reads it without knowing what kind of field it is.

The only thing a composite owns is **list/layout mechanics** (add/remove/reorder/collapse). All structural mutations go through atomic form actions exposed by `useFormActions()` — no plugin pokes the store directly. ([ADR-010 §6](../010-form-state-model.md))

## Field addresses

A Field address is the stable identity of a field instance — the path from the form root:

```
title
blocks.block-12.cta.label
body.embed-7.text
```

- **Array segments use stable per-item keys** (`block-12`), assigned at item creation — *not* positional indices. Reordering items keeps the same address. Positions exist only at the render layer.
- **An address may terminate at any node, leaf or composite.** `blocks.block-12.cta` (an object) is a valid target — used by visual editing when an editor clicks a composite region.
- Component resolution mints addresses by prepending each composite's segment as it delegates.

One identity serves **nested rendering, validation targeting, active-field highlighting, and the visual-editing marker**. ([ADR-009 §3](../009-field-plugins.md))

## Visual editing

Click-to-edit `postMessage`s a Field address across the preview iframe; the form sets it as the single active field.

- **Reveal** (expand collapsed ancestors, scroll into view) is **runtime-owned and universal**. It works for *any* addressable node without the field cooperating. A field that does nothing is still revealed.
- **Activate** (focus input, open popover, center map) is **field-owned and opt-in** — via `useFieldActivation(handler)`.
- There is **no manifest-declared focus hook.** Manifest hooks (`onInit`/`onDestroy`) are *plugin-lifecycle* (once per plugin); activation is *per field instance* (there can be fifty string fields on screen), so it lives inside the component.
- When the active address terminates at a **composite**, the default is **reveal-and-stop** — never auto-drill into a descendant. ([ADR-009 §4](../009-field-plugins.md))

## Rich-text embeds — composite children, not nested forms

A rich-text field's **prose** is its opaque value (the editor's AST — Lexical, Tiptap, whatever). Each **embedded block** (e.g. `<Cta>`, a template instance) is an **anchor** in that AST (stable key + position) whose field data lives at `body.<key>.*` — **the same `Form` scope**, addressed like any field.

So an embed is:
- **Focusable** by Field address.
- **Editable** through the same hooks as any field.
- **Cloneable** through the same form actions.

The editor routes embed insert/move/delete through the form's structural actions — it cannot mutate embeds in isolation. Presentation (inline, popover, panel) is independent of mechanism — all the same `Form`, just a different mount point.

A **reference field**, by contrast, points at a *different* document and gets a second `Form` scope. ([ADR-009 §5](../009-field-plugins.md))

## Validation

Two layers. Each runs in the form resolver, so every message lands in the
form's error state at the field's address: it shows under the field, appears in
the form-level summary, and blocks save.

1. **Plugin-level custom validation** declared on the field plugin's segment.
   Runs on every field of the `type` that plugin owns.
2. **Field-level validators**, registered by a plugin under a name and attached
   to individual fields in the collection, with parameters. Runs last, in the
   order the field lists them.

`required`, `min`, `max` and `pattern` are layer 2: v4 supplies them as
first-party validators, so there is one way to write a rule, not two.

```ts
t.string({ name: 'title', validators: [required(), min(3)] })
t.array({ name: 'tags', fields: [...], validators: [max(5)] })
```

A field plugin's `schema(node)` still runs first, but it is not a layer of
rules. It gives the shape of the value and the coercion the editor needs: a
number field holds a string in the form and a number in the document. It reads
no `required`, `min`, `max` or `pattern`.

Layers 1 and 2 return the same thing: one message, a list of messages, or
`null` for "passed". They differ in what they can see. A plugin-level rule is
scoped to its own field; a field-level rule sits in a collection, so it also
sees the fields around it.

```ts
type Validate<T = unknown, C = PluginValidationContext> =
  (value: T, context: C) => string | string[] | null

interface PluginValidationContext {
  node: FieldSchema      // this field's schema node: { name, type, label, … }
  address: FieldAddress  // where it sits: 'slug', or 'events.<key>.endDate'
}

interface FieldValidationContext extends PluginValidationContext {
  siblings: Record<string, unknown>  // the object this field sits in
  values: Record<string, unknown>    // the whole document
  isEmpty: (value: unknown) => boolean          // what `required` asks
  measure: (value: unknown) => FieldMeasure | null  // what `min`/`max` compare
}
```

The shape follows Zod's `superRefine((value, ctx) => …)`. A rule that ignores
`context` and returns one string is still a valid `Validate`.

### The rules v4 supplies

`required`, `min`, `max` and `pattern` are registered by a core plugin. Two
descriptor hooks let a field type answer them, so one rule serves every type:

- `isEmpty(value)` is what `required` asks. The default counts `null`,
  `undefined`, `''`, an empty array and an empty object as empty. The rich-text
  field declares its own, because an empty paragraph is an empty document. The
  boolean field declares `() => false`, so `required` has no effect on a
  checkbox.
- `measure(value)` is what `min` and `max` compare, as `{ amount, unit? }`. A
  string measures its length in `characters`, an array its `items`, a number
  its own value. The number field declares its own, because the editor holds a
  string.

`min` and `max` pass an empty value and let `required` report it, so a field
with both rules reports one message, not two.

**These rules run on the Client, not inside TinaCloud.** Before this change the
first layer was declarative and serialisable, so TinaCloud could in principle
enforce it. Nothing ever did: no server in v3 or v4 reads those rules, and the
Data Layer writes content without them. Making them validators costs no
enforcement that existed, and it removes a whole concept from the model. A rule
that must hold on managed TinaCloud needs a serialisable rule set that TinaCloud
itself evaluates, which is a separate decision (ADR-015).

### Plugin-level: `validate` on the field plugin

```ts
export default defineClientPlugin({
  field: {
    type: 'email',
    Component: EmailField,
    validate(value: string) {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email'
      return null
    },
  },
})
```

### Field-level: named validators

A plugin registers validators under names. Each validator is a factory: it takes
its parameters and returns a `Validate`, the way `z.string().min(5)` takes `5`.
A validator never hard-codes a sibling name; the collection passes it in. The
manifest lists the names, so the build can check them without loading client
code; the client segment holds the factories. `validator` is a **Keyed
capability** keyed by name: two plugins that register the same name are a
Capability conflict (ADR-006). Names are global, so a third-party plugin gives
its own a prefix (`acme.after`); a first-party name stays bare (`required`).

```ts
// manifest
definePlugin({
  name: 'acme:validators',
  provides: ['validator'],
  validators: ['after', 'matches'],
  client: () => import('./validators.client'),
})

// validators.client.ts
export default defineClientPlugin({
  validators: {
    after:
      (other: string): Validate<string, FieldValidationContext> =>
      (value, { siblings }) => {
        const start = siblings[other]
        if (!value || typeof start !== 'string' || value > start) return null
        return `Must be after ${other}`
      },
    matches:
      (pattern: string, message = 'Invalid format'): Validate<string, FieldValidationContext> =>
      (value) => (value && !new RegExp(pattern).test(value) ? message : null),
  },
})

// validators.ts: the same plugin exports typed helpers for collection authors
export const after = (other: string) => ({ name: 'after', args: [other] })
export const matches = (pattern: string, message?: string) =>
  ({ name: 'matches', args: [pattern, message] })
```

The collection attaches validators to the fields that need them:

```ts
t.datetime({ name: 'endDate', validators: [after('startDate')] })
t.string({ name: 'slug', validators: [matches('^[a-z0-9-]+$', 'Lowercase letters, digits and dashes only')] })
```

A validator entry is `{ name, args }`, plain JSON, so the field's `validators`
serialise into `tina-lock.json`; the build fails on a name no installed plugin
registers. The validator's code runs on the client (editor UX) and in
`tina doctor` (ADR-020), never inside TinaCloud (ADR-015). A rule that must hold
on managed TinaCloud has to be expressible as a layer 1 declarative rule.

### Cross-field rules

`context.siblings` is the object the field sits in: for `events.<key>.endDate`
it is that one event, not the document root. `context.values` is the whole
document. Both are read-only snapshots taken when the resolver runs, and both
reach field-level validators only.

`useSiblingValue(address, name)` stays a component hook for conditional UI
(show, hide, enable). It is not a validation path: a message a component
computes never enters the form's error state, so it cannot block save or appear
in the summary. Put the rule in a validator instead.

A rule that needs server-only context (does this reference target exist) runs
in a server segment.

## Server segment for fields

A field plugin can optionally have a server segment for type-specific server concerns:

```ts
// server.ts
import { defineServerPlugin } from 'tinacms/server'

export default defineServerPlugin({
  // e.g. validating a reference field's target exists in the content store
  async validateReference(address: string, targetId: string) { … },
  // serialization/transform that needs server-only data
  async parseImage(input: { path: string }) { … },
})
```

Called from the client segment via Capability RPC: `server.field.validateReference(...)`. The transport authenticates by default; use `publicOp()` to opt out. ([ADR-008](../008-authorization-permissions-roles.md))

## A complete custom field (color picker)

```ts
// plugin.ts
import { definePlugin } from 'tinacms'

export default definePlugin({
  name: 'color-field',
  provides: ['field'],
  client: () => import('./client'),
})

// client.ts
import { defineClientPlugin } from 'tinacms'
import { useFieldAddress, useFieldValue } from 'tinacms/react'

function ColorField() {
  const address = useFieldAddress()
  const [value, setValue] = useFieldValue<string>(address)
  return (
    <div>
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => setValue(e.target.value)}
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
        maxLength={7}
      />
    </div>
  )
}

export default defineClientPlugin({
  field: {
    type: 'color',
    Component: ColorField,
    defaultValue: '#000000',
    validate(value: string) {
      if (value && !/^#[0-9A-Fa-f]{6}$/.test(value)) return 'Must be a hex color'
      return null
    },
    metadata: { layout: 'inline' },
  },
})

// usage in user's schema: the plugin's `type` picks the field
t.color({ name: 'primaryColor', label: 'Primary Color' })
```

## Removed from earlier drafts

If you previously saw these in this doc, they are gone:

| Removed | Replaced by |
|---|---|
| `defineFieldPlugin({...})` | `definePlugin({ provides: ['field'], client: () => … })` |
| `Component: ({ value, onChange, field, error })` props | `useFieldValue(address)` + `useFieldErrors(address)` hooks |
| `store.getPlugin('media')` | `useFieldActivation`, sibling hooks, or RPC (`server.media.*`) |
| Array field walking `field.itemField` and calling `getFieldPlugin(type).Component` | Component resolution: `<Field address={…} />` |
| `field.parent` for conditional validation | `context.siblings` in a validator; `useSiblingValue(address, name)` for conditional UI |
| Holding per-field state in a plugin's Zustand slice | Form is core; field plugins hold no persistent slice |

## Related

- [ADR-009](../009-field-plugins.md) — the decision in full
- [ADR-010](../010-form-state-model.md) — flat form state, hooks-as-subscriptions
- [Custom Plugins](./custom-plugins.md) — full-stack plugin patterns
- [State Management](../architecture/state-management.md) — where Form sits
