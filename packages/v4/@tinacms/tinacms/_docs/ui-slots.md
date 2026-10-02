# UI slots

A UI slot is a named region of the admin. Many plugins contribute into one
slot. The contributions stack. They do not conflict, and no contribution
replaces a different one. Refer to
[ADR-013](https://github.com/tinacms/tinacmsv4-docs/blob/main/adr/013-ui-extension-slots.md)
for the decision.

A slot is not a capability. A capability such as `field` or `media` has one
provider for each key, and a second provider is a conflict. A slot has no keys
and no `overrides`.

The core owns the list of slots. A plugin cannot define a new slot. v4 has one
slot now: `globalNav`.

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

`examples/barebones/tina/help-nav.tsx` is a full example.

## `globalNav`

`globalNav` is the list of entries in the admin sidebar, below the
collections. Each entry is a `GlobalNavEntry` (`core/slot/contract.ts`):

| Property | Type | Role |
|---|---|---|
| `label` | `string` | The text of the entry. It must not be empty. |
| `icon` | `ComponentType<{ className?: string }>` | The icon before the label. The sidebar gives it a `className` for its size. |
| `target` | `NavTarget` | What a click does. Refer to the table below. |
| `order` | `number` | The position. A lower number comes first. The default is `0`. |
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
- **Screen targets:** a `screen` target must name a screen that an installed
  plugin contributes. If it does not, boot throws `global-nav-unknown-screen`
  (`core/slot/global-nav.ts`).
- **Labels:** an entry with an empty `label` throws `global-nav-no-label` at
  boot.
- **Screens and entries are separate:** a screen does not get a sidebar entry
  automatically. To show a screen in the sidebar, contribute a `globalNav`
  entry with a `screen` target.

### Read the entries

`useGlobalNav()` (`@tinacms/tinacms/admin`) gives the entries after the
filter and the sort. The admin sidebar uses it.

## Not supported yet

- **Permissions:** ADR-013 gates a contribution with
  `requires: { permission }`. v4 has no permission system yet (ADR-008). Thus
  every entry renders for every user.
