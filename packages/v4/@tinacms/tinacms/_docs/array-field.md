# The `array` field

The `array` field is one of the field plugins that v4 supplies. It holds a
list of items, and the author adds, removes, and reorders them. Each item is
an object of fixed fields (`fields`), a block of one of several templates
(`templates`), or a single value (`of`). It is a compound field — see
[field-plugins.md](./field-plugins.md#compound-fields) for the shared
mechanism it uses.

## Files

The files are in `plugins/fields/array/`:

| File | Role |
|---|---|
| `array-field.schema.ts` | The `t.array()` helper function, and the `arraySchema` validator |
| `array-field.client.tsx` | The descriptor, which takes the `array` key |
| `array-field.ui.tsx` | The connected `ArrayField` and `ArrayDrillIn`: the form array, the keys, the headings, the error counts |
| `array-field.view.tsx` | `ArrayFieldView` and `ArrayDrillInView`: plain props in, List cards out. It reads no store |
| `array-field.states.tsx` | `arrayFieldStates`: one entry for each look, used by the design sign-off and the render test |
| `array-field.plugin.ts` | The manifest, `tina:field:array` |

## Authoring

`t.array({...})` adds `type: 'array'` (`ARRAY_FIELD_TYPE`) to the config. An
array declares its items with exactly one of `fields`, `templates` or `of`
([ADR-017 §4](https://github.com/tinacms/tinacmsv4-docs/blob/main/adr/017-content-model.md)).
Each shape sets the other two keys to `never`, so TypeScript rejects a config
that sets two of them. `asArrayFieldSchema` makes the same check at runtime.

```ts
import { t, type TemplateSchema } from '@tinacms/tinacms';

const hero = {
  name: 'hero',
  label: 'Hero',
  defaultItem: { headline: 'A new hero' },
  fields: [t.string({ name: 'headline', label: 'Headline' })],
} satisfies TemplateSchema;

const collection = {
  name: 'page',
  fields: [
    // Every item has the same shape.
    t.array({
      name: 'authors',
      fields: [t.string({ name: 'name', label: 'Name' })],
    }),
    // Each item picks a template. This is a block-based field.
    t.array({ name: 'blocks', templates: [hero] }),
    // Each item is a single value of the `of` field type.
    t.array({ name: 'tags', of: t.string({ name: 'tag', label: 'Tag' }) }),
  ],
};
```

| Key | Type | Items | Stored value |
|---|---|---|---|
| `fields` | `FieldSchema[]` | objects with one shape | `[{ name: 'Ivan' }]` |
| `templates` | `TemplateSchema[]` | objects, each with its own template | `[{ _template: 'hero', headline: 'Hi' }]` |
| `of` | `ScalarFieldSchema` | single values; an object or array here is rejected (ADR-017 §4) | `['news', 'release']` |

A template of a templates array has `name`, `label?`, `fields`, `defaultItem?`,
`itemLabel?` and `previewImage?`. A rich-text embed template takes only `name`,
`label?`, `fields` and `defaultItem?`.

### Array options

| Key | On | Effect |
|---|---|---|
| `defaultItem` | a `fields` array, a scalar array, a template | The starting value of a new item. |
| `itemLabel` | a `fields` array, a template | `(item) => string`. The row heading. |
| `picker` | a `templates` array | `'list'` or `'grid'`. How an editor picks a block to add. |
| `previewImage` | a template | The image the grid picker shows. |

- `defaultItem` takes a scalar on a scalar array (it wins over `of.defaultValue`)
  and a document on a `fields` array. A templates array takes no `defaultItem`
  on the array: set it on each template. Keys that the document omits fall back
  to field and plugin defaults.
- `itemLabel` receives the item's current form value, so the heading follows
  what the editor types. When the result is empty or not a string, or when the
  function throws, the card shows the first text field of the item instead. A scalar array and a
  rich-text template take no `itemLabel`. It is a function, so it is never
  written to `tina-lock.json`.
- `picker` defaults to `'grid'` when any template has a `previewImage`, and to
  `'list'` otherwise. It replaces the v3 `visualSelector`.
- `previewImage` is a path relative to the media root, with no URL scheme. It
  replaces the v3 `previewSrc`.

```ts
t.array({
  name: 'blocks',
  picker: 'grid',
  templates: [
    {
      name: 'hero',
      previewImage: '/blocks/hero.png',
      defaultItem: { headline: 'New hero' },
      itemLabel: (item) => String(item.headline ?? ''),
      fields: [t.string({ name: 'headline' })],
    },
  ],
})
```

`hidden` and `description` on the `of` field of a scalar array fail the build.
Set them on the array.

Every field also takes `description`, `defaultValue` and `hidden`. Refer to
[Options every field takes](./field-plugins.md#options-every-field-takes).

> `required`, `min`, `max` and `pattern` are no longer config keys. They are
> validators that a core plugin registers, and a collection attaches them with
> `validators`. Refer to
> [Validation in two layers](./field-plugins.md#validation-in-two-layers).


## The descriptor

The client segment (`array-field.client.tsx`) takes the `array` key:

```tsx
defineClientPlugin({
  field: {
    Component: ArrayField,
    DrillInComponent: ArrayDrillIn,
    // No defaultValue — an absent list starts as null and is not saved.
    metadata: { layout: 'block', labelable: false, drillable: true },
    schema: arraySchema,
    parse, serialize,       // recurse into item fields — see below
    validateChildren,       // recurse into item fields, at any depth — see below
  },
});
```

A scalar list asks the registry for the `ListView` of its `of.type`. A field
descriptor that sets `ListView` draws the whole list itself, as the image field
does with its gallery. Without one, the list draws one row per item.

`metadata.labelable: false` because the field has no single input for a row's
`htmlFor` to reach. The component carries its own accessible name with
`aria-labelledby` instead — see
[Accessibility](../../../CLAUDE.md#accessibility) in the v4 CLAUDE.md.

## Validation

`arraySchema(node)` checks that the value is a list: a list of objects for
`fields` and `templates`, any list for `of`. A value of the wrong shape fails
with `<label> must be a list of items`. The `required`, `min` and `max`
validators check the item count.
`required` implies `min: 1` unless `min` is set explicitly:

| Config | Rule | Message |
|---|---|---|
| `required` (no `min`) | fewer than 1 item | `<label> needs at least 1 item` |

That schema checks the array's own shape only — it does not look inside an
item. Each item's own rules run through `validateChildren(value, node,
address, registry)`, which calls `validateFieldTree` (`core/validation.ts`)
and merges what it returns:

- For `fields`, it runs each item field at
  \`${address}.${index}.${subfield.name}\`.
- For `templates`, it looks up each item's template by `_template` and runs
  that template's fields at the same addresses. An item whose template is
  unknown is skipped.
- For `of`, it runs the `of` field on each item at \`${address}.${index}\`. It builds each item's address from its own `address` parameter, not
`node.name` — an array nested inside another array is not addressed by its
bare name (`members`), only by where it actually sits
(`groups.0.members`).

`validateFieldTree` is what makes an array of arrays validate correctly: it
runs `validateField` for the item field, then — because an item field can
itself be an `array` — calls that item field's own `validateChildren` too,
passing its own nested address down. So the recursion is not array-specific
code reaching into another array; it is every compound field calling the same
function, each with its own current address. A future compound field (a
`reference` embedding some of the referenced document's fields, say) gets this
for free the same way, and composes with `array` — a reference inside an
array, or an array inside a reference — without either field's code knowing
the other exists. The resolver (`editor/resolver.ts`) starts this same call
for each top-level field, then merges everything it returns in beside the
array's own cardinality messages. Thus each item field, at any depth, reports
its own errors through `useFieldErrors` at its own address, the same way a
top-level field does.

An item's message also reaches the array's own address, and every array
above it — an item collapsed inside a closed nested array still needs to be
visible from outside. This is not something `validateChildren` writes into
the tree: react-hook-form represents `authors` (a name `useFieldArray`
registers) as a real array of its items' errors, and drops any `type`/
`message` of the array's own sitting alongside that array — so the array's
own address is never itself an entry once an item errors. `useFieldErrors`
(`editor/hooks.ts`) gets there anyway, by reading rather than writing:
`collectFieldErrorMessages` (`editor/field-errors.ts`) walks every node under
an address in whatever tree react-hook-form actually kept, and collects
every message underneath. So `useFieldErrors('authors')` sees an item's
message the same way `useFieldErrors('authors.0.name')` does — and for
`groups`/`members` nesting, `useFieldErrors('groups')` sees a message from
`groups.0.members.0.name` too. Refer to
[field-plugins.md](./field-plugins.md#compound-fields).

## Ingest and digest

`parse` and `serialize` recurse: for each stored item, `parse` calls
`ingestDocument(item, field.fields, registry, context)`
(`core/form/ingest.ts`); for each edited item, `serialize` calls
`digestDocument(item, field.fields, registry, context)`. Both read the
registry from `context.registry` (`FieldTransformContext`,
`core/field/contract.ts`), which the form provider and the save path set. Thus
an item field with its own `parse`/`serialize` — a nested `datetime` field, for
example — converts the same way it would at the top level.

For `templates`, `parse` reads the `_template` of each item and uses the fields
of that template. `parse` and `serialize` keep `_template` on every item. An
item with no `_template`, or with an unknown one, passes through `parse` and
`serialize` unchanged, with a console warning. The component shows it as an
unknown block that the editor can move or remove, so a renamed or removed
template never deletes content. An item of a `fields` or `templates` array that is
not an object is kept the same way, shown read-only with its stored value, and
fails validation (`<label> must be a list of items`) until it is removed. A
value that is not a list at all is shown read-only for the whole field. For `of`,
`parse` and `serialize` call the `parse`/`serialize` of the `of` field type on
each item.

The registry is necessary: `invariant` throws `array-field-no-registry` if
`context.registry` is absent when `parse` or `serialize` runs.

### A stored value of the wrong shape

A hand-edited file can hold a value that is not a list of objects, such as
`authors: Ivan`. ADR-012 says a document must never fail to open, so `parse`
and `serialize` return that value unchanged, and a save writes it back as it
was. The schema rejects it with `<label> must be a list of items`, and
`validateChildren` checks no items. The component shows the raw value
read-only (`plugins/fields/uneditable-value.tsx`), with a Clear button that
sets the field to an empty list.

## The component

`ArrayField` (`array-field.ui.tsx`) owns the data. `ArrayFieldView`
(`array-field.view.tsx`) draws it. Remove and move go through `useRemoveListItem`
and `useMoveListItem`. Those rewrite the list at its nested address, such as
`groups.0.members`, so the defaults and the item errors move with the items.
The view takes plain props, so every look is a story in `array-field.states.tsx`
and a case in one render test.

The list uses react-hook-form's `useFieldArray({ control, name: address })`
for add, insert, remove and reorder. It has stable item keys, so React does
not misalign inputs across a reorder. A scalar (`of`) list keeps its own keys.

### Cards

Each item is a List card in a card list.

- An item of `fields` or `templates` is a group card. The head shows the
  `itemLabel` result, or the template label for a block, then the first text
  field of the item. A card with nothing to show says "Empty item".
- A scalar string or number item is a value box in the card. A number box holds
  text in the form, and `serialize` turns it into a number on save.
- Any other `of` type (boolean, datetime, select, image, and so on) keeps its
  own widget inside a card whose head does not fold.
- A closed card with errors shows a red count. An open card shows none, because
  its fields show their own errors.
- The Add control ends the list. A list of strings or numbers with no
  `defaultItem` uses a box: type a value, press Enter. Any other list uses a
  button. A block array shows the `list` or `grid` picker.
- An empty list says so. A read-only list has no container, no Add control and
  no menu. A disabled list has no hover and no menu.

### Opening an item

The depth of an item is the depth of its fields: the depth of the array plus
one (`itemOpensNextLevel` in `editor/form-view-state.ts`). Array positions are
not levels.

- At depth 1 and 2, the card opens in place. Its head sticks to the top while
  its fields scroll, two deep at most (`FormLevel` `pinHeaders`).
- At depth 3 and deeper, the card opens as the next form level. The level
  holds a stand-in `object` node built from the fields of the item
  (`itemLevel`), and the Field trail shows the item as a step.
- Focus on a field inside an open item level keeps the level open. A deep link
  or an error jump opens it.
- An array at depth 3 or deeper first drills in as a whole, with the
  `ArrayDrillIn` card (item count, invalid count). Its items then follow the
  item rule.

### Item actions

The item menu holds Move up, Move down, Insert above, Insert below, Duplicate
and Remove. Remove acts at once, with no dialog and no Undo bar. Drag the grip
to reorder, or press the up and down arrow keys while the grip has focus.

After Remove, focus goes to the grip of the next item, else the previous item,
else the Add control. After Insert, Duplicate or a move, focus goes to the grip
of the item. A new object item opens.

A `max` validator on the array sets the full state. When the list is full, the
Add control is off and says why, and Insert above, Insert below and Duplicate
are off with the hint "List is full".

For a block array, Insert above and Insert below open the template picker at
that place, and the chosen template goes in there.

### Item fields

For each item field the card renders `<NestedFieldRow address node>`
(`editor/field.tsx`). `<FieldNode>` supplies `FieldAddressContext` and
`FieldSchemaContext`, so an item field's own `useFieldActivation` works for
visual editing at its nested address.

A new `fields` item starts from `ingestDocument({}, field.fields, …)`, the
same seeding that a new top-level form gets. A new template item starts from
the `defaultItem` of its template. A new `of` item starts from the
`defaultItem`, then the `defaultValue` of the `of` field, then the default of
its type, or `null`. For `of`, an empty item (`null` or `undefined`) skips
`parse` and `serialize`, and it saves as `null`.

## The connections

- The manifest is `array-field.plugin.ts`. Its name is `tina:field:array`,
  and it exports `arrayFieldPlugin`.
- The registration is in `plugins/fields/index.ts`. That file adds the plugin
  to `corePlugins`, and it supplies `t.array`.

## Tests

`array-field.states.test.tsx` renders every entry of `arrayFieldStates`. It
checks the roles, the names, the inert states, the item menu, the full state and
the error count. `array-field-actions.test.tsx` covers Insert, Duplicate, the
arrow keys on the grip, Remove with its focus, the full state, and the scalar
lists. `admin/nested-levels.test.tsx` covers the item level.

`array-field.test.tsx` does these tests:

- It renders each item's fields, adds an item, removes an item, and reorders
  items.
- It writes an edit to an item field back through the store at its nested
  address.
- It rejects too few items on a required field, and too many items past `max`.
- It rejects an invalid item field value, with the message at the item's own
  nested address.
- It rejects an invalid value inside an array nested inside an array, with
  the message at the doubly-nested address, via a direct `validateChildren`
  call.
- It rolls an item field's error up onto the array's own address, and up
  through every ancestor array for a doubly-nested item.
- It goes dirty on a reorder, then back to clean once edits restore the
  original values.
- It round-trips items through ingest and digest, including an item field
  with its own `parse`/`serialize`.
- It keeps a stored value that is not a list of objects unchanged through
  ingest and digest, rejects it in validation, shows it read-only, and clears
  it.
- It examines the metadata of the descriptor.
- It rejects a config with none, or more than one, of `fields`, `templates`
  and `of`, at the type level and at runtime.
- For `templates`: it keeps `_template` through ingest and digest, keeps an
  item with a missing or unknown template unchanged and shows it as an unknown
  block, renders the label and fields of each template,
  adds an item from `defaultItem`, keeps the template on a reorder, and
  validates each item against its own template.
- For `of`: it runs the `parse`/`serialize` of the `of` field on each item,
  refuses stored content that is not an array, edits, adds, reorders and
  removes items, and validates each item at `<address>.<index>`.
