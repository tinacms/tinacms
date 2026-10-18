# UI slots

A UI slot is a named region of the admin. Many plugins contribute into one
slot. The contributions stack. They do not conflict, and no contribution
replaces a different one. Refer to
[ADR-013](https://github.com/tinacms/tinacmsv4-docs/blob/main/adr/013-ui-extension-slots.md)
for the decision.

A slot is not a capability. A capability such as `field` or `media` has one
provider for each key, and a second provider is a conflict. A slot has no keys
and no `overrides`.

The core owns the list of slots. A plugin cannot define a new slot. v4 has two
slots now: `globalNav` and `navGroups`.

## Contribute to a slot

A contribution goes in the `slots` property of the client segment
(`ClientSegment`, `core/plugin.ts`). The admin collects every contribution one
time, at boot.

```tsx
import { definePlugin } from '@tinacms/tinacms';
import { defineClientPlugin } from '@tinacms/tinacms/client';

export const helpPlugin = definePlugin({
  name: 'example:help',
  client: async () => ({
    default: defineClientPlugin({
      screens: [{ name: 'help', label: 'Help', component: HelpScreen }],
      slots: {
        globalNav: [
          { label: 'Help', icon: HelpIcon, target: { kind: 'screen', screen: 'help' } },
        ],
      },
    }),
  }),
});
```

`examples/barebones/tina/help-nav.tsx` is a full example. `tinaCloud()`
(`plugins/tinacloud/nav/tinacloud-nav.client.ts`) is a shipped plugin. It
declares the Cloud group and puts three `url` entries in it: Project Config,
User Management and Support. A project without `tinaCloud()` does not show
them.

## `globalNav`

`globalNav` is the list of entries in the admin sidebar, below the
collections. Each entry is a `GlobalNavEntry` (`core/slot/contract.ts`):

| Property | Type | Role |
|---|---|---|
| `label` | `string` | The text of the entry. It must not be empty. |
| `icon` | `ComponentType<{ className?: string }>` | The icon before the label. The sidebar gives it a `className` for its size. |
| `target` | `NavTarget` | What a click does. Refer to the table below. |
| `order` | `number` | The position. A lower number comes first. The default is `0`. In a group, `order` is the position in the group. |
| `group` | `string` | The `id` of a group in `navGroups`. The entry renders under the heading of that group. |
| `dependsOn` | `Capability[]` | The capabilities the entry needs. If no installed plugin provides one of them, the entry does not render. |

`NavTarget` has three kinds:

| Kind | Type | Shape | A click |
|---|---|---|---|
| `screen` | `ScreenTarget` | `{ kind: 'screen', screen }` | Opens the admin screen with that name. |
| `url` | `UrlTarget` | `{ kind: 'url', href }` | Opens `href` in a new tab. |
| `action` | `ActionTarget` | `{ kind: 'action', run }` | Calls `run`, for example to open a dialog. |

### Rules

- **Order:** the sidebar sorts entries by `order`. Entries with the same
  `order` keep the order of the plugins in `defineConfig`, then the order in
  the `globalNav` array.
- **Groups:** an entry with a `group` must name a group that an installed
  plugin declares. If it does not, boot throws `global-nav-unknown-group`.
- **Screen targets:** a `screen` target must name a screen that an installed
  plugin contributes. If it does not, boot throws `global-nav-unknown-screen`
  (`core/slot/global-nav.ts`).
- **Labels:** an entry with an empty `label` throws `global-nav-no-label` at
  boot.
- **Screens and entries are separate:** a screen does not get a sidebar entry
  automatically. To show a screen in the sidebar, contribute a `globalNav`
  entry with a `screen` target.

## `navGroups`

`navGroups` is the list of headings in the global nav. Refer to
[ADR-027](../../../../../adr/v4/027-global-nav-groups.md) for the decision.
Each group is a `NavGroup` (`core/slot/contract.ts`):

| Property | Type | Role |
|---|---|---|
| `id` | `string` | The value that an entry puts in `group`. The `id` does not show. |
| `label` | `string` | The heading text. |
| `order` | `number` | The position of the group among the entries that have no group. The default is `0`. |

```ts
slots: {
  navGroups: [{ id: 'tinacloud', label: 'Cloud', order: 100 }],
  globalNav: [
    { label: 'Support', group: 'tinacloud', icon: HelpIcon, target: { kind: 'url', href } },
  ],
}
```

### Rules

- **Position:** groups and entries without a group sort together, each by its
  own `order`. The `order` of an entry in a group does not move the group.
- **Shared groups:** a plugin can put entries in a group that a different
  plugin declares.
- **One declaration:** two plugins cannot declare the same `id`. Boot throws
  `global-nav-duplicate-group`.
- **Empty groups:** a group with no entry to show does not render.

## Read the nav

`useGlobalNav()` (`@tinacms/tinacms/admin`) gives a list of `GlobalNavItem`
values after the filter and the sort. An item is an entry without a group
(`kind: 'entry'`), or a group with its sorted entries (`kind: 'group'`). The
admin sidebar uses it.

## Not supported yet

- **Permissions:** ADR-013 gates a contribution with
  `requires: { permission }`. v4 has no permission system yet (ADR-008). Thus
  every entry renders for every user.
