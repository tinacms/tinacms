# The `image` field

The `image` field is one of the field plugins that v4 supplies. It holds the
path of one media file, so that the `media` capability can turn the path into a
URL. The source code is in `plugins/fields/image/`.

## Files

The files are in `plugins/fields/image/`:

| File | Role |
|---|---|
| `image-field.schema.ts` | The `t.image()` helper function, the `ImageFieldSchema` type, and the `imageSchema` validator |
| `image-field.client.tsx` | The descriptor, which takes the `image` key |
| `image-field.ui.tsx` | The `ImageField` component |
| `image-field.plugin.ts` | The manifest, `tina:field:image` |

## Authoring

`t.image({...})` is the typed function that you call in a collection. It adds
`type: 'image'` (`IMAGE_FIELD_TYPE`) to the config:

```ts
import { t } from '@tinacms/tinacms';

const collection = {
  name: 'post',
  fields: [t.image({ name: 'cover', label: 'Cover' })],
};
```

The config (`ImageFieldSchema`, which extends `BaseFieldSchema`):

| Key | Type | Effect |
|---|---|---|
| `name` | `string` (necessary) | The field key in the document. It is also the alternative label. |
| `label` | `string` | The label on the screen. The validation messages use it. |
| `accept` | `MediaAccept \| MediaAccept[]` | What a media picker offers: media extensions (`'png'`) or whole categories (`'image'`). |

`MediaAccept` is the vocabulary of `plugins/media-manager/media-types.ts`, the
module that lists every extension and its category. The field imports that type,
so a name that the media manager does not know is a type error at the authoring
site. The value is plain JSON, so `compileSchema` writes it to `tina-lock.json`
without a change.

When `accept` is absent the field stores no list of its own. A media picker reads
it, and a picker with no list offers every media type.

## The value is a path, not a URL

Per ADR-022 §5, the value is a media path relative to the media root:
`posts/hero.jpg`. It is never a URL. The provider turns a path into a URL with
`resolveUrl`, so a change to the media root, or to the way a CDN forms an image
URL, does not rewrite the content files.

## The descriptor

The client segment (`image-field.client.tsx`) takes the `image` key:

```tsx
defineClientPlugin({
  field: {
    Component: ImageField,
    defaultValue: '',         // seeds a new/absent field on ingest
    metadata: { layout: 'inline' },
    schema: imageSchema,      // node -> ZodType
  },
});
```

The descriptor does not carry `type`. `image-field.plugin.ts` claims the `image`
key with `field: { type: IMAGE_FIELD_TYPE, contractVersion: 1 }` on the manifest
(see
[`field-plugins.md`](./field-plugins.md#2-the-client-segment-and-the-descriptor-clienttsx)).

The descriptor has no `validate`, `parse`, or `serialize` function. TinaCMS
stores the path without a change, and `schema` holds the rules.

## Validation

`imageSchema(node)` (`image-field.schema.ts`) converts the config into a Zod
schema. It holds no constraints of its own, because a media path has no length
bound and no pattern that holds across providers. The shape of the value only:

| Config | Rule | Message |
|---|---|---|
| `validators: [required()]` | The field holds no path | "Cover is required" |
| no `validators` | Any path, or none | — |

These conditions are important:

- **Optional fields** — The schema changes `''` and `null` to `undefined`, and
  those values pass validation as `.optional()`. Thus an empty optional image
  field is correct.
- **`accept` is not a validator.** It tells a picker what to offer. A path that
  names a file of another type is a correct value; nothing about the stored value
  checks it.
- **The scope of the schema** — `imageSchema` uses the node of this field only.

These rules run on the shared two-layer path. `validateField` calls
`descriptor.schema`, then it calls `descriptor.validate`. Refer to
[`field-plugins.md`](./field-plugins.md#validation-in-two-layers).

## The component

`ImageField` (`image-field.ui.tsx`) has no props. It reads its address from the
context. It gets the value and the errors from hooks that use the address. Thus
a keystroke renders this field again, but does not render the other fields
again.

```tsx
export function ImageField() {
  const address = useFieldAddress();
  const [value, setValue] = useFieldValue<string>(address);
  const errors = useFieldErrors(address);
  const inputRef = useRef<HTMLInputElement>(null);

  useFieldActivation(() => inputRef.current?.focus()); // focus when active

  return (
    <FieldWrapper errors={errors}>
      <Input ref={inputRef} id={address} value={value ?? ''}
        onChange={(e) => setValue(e.target.value)} />
    </FieldWrapper>
  );
}
```

### A field type does not depend on the media capability

`useMediaSlice()` throws when no media capability is mounted, so the field reads
the `media` slice through the store directly instead. A field type is content
the author can use without installing every capability: a `string` field does not
need a media plugin, and neither does an `image` field. A picker is a later
addition, and the field must render without one.

## The connections

- The manifest is `image-field.plugin.ts`. It calls `definePlugin({ name:
  'tina:field:image', provides: ['field'], field: { type: IMAGE_FIELD_TYPE,
  contractVersion: 1 }, client: () => import('./image-field.client') })`, and
  it exports `imageFieldPlugin`.
- The registration is in `plugins/fields/index.ts`. That file adds the plugin to
  `corePlugins`, and it supplies `t.image`.

## Tests

`image-field.test.tsx` does these tests:

- It registers the descriptor under the `image` key.
- It renders the value from the document.
- It uses the default value when the document has no value.
- It writes a keystroke to the value.
- It passes a stored media path through the shared validation path.
- It shows the shared message for an empty required field.
- It accepts an empty or a missing optional field.
- It converts a value with ingest, then converts it again with digest. This test
  includes a `null` value and an absent value.
- It carries `accept` through the config, as one entry and as a list.
- It examines the metadata of the descriptor in the registry.