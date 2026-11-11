# UI slots

A UI slot is a named region of the admin. Many plugins contribute into one
slot. The contributions stack. They do not conflict, and no contribution
replaces a different one. Refer to
[ADR-013](../../../../../adr/v4/013-ui-extension-slots.md)
for the decision.

A slot is not a capability. A capability such as `field` or `media` has one
provider for each key, and a second provider is a conflict. A slot has no
`overrides`. A contribution to `globalNav` has no key. A group in `navGroups`
has an `id` only so that entries can refer to it.

The core owns the list of slots. A plugin cannot define a new slot. v4 has
three slots now: `globalNav`, `navGroups` and `home.panel`.

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
  plugin declares. If it does not, boot throws `global-nav-unknown-group`,
  also for an entry that `dependsOn` hides.
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
- **Ties:** a group and an entry with the same `order` keep the order of the
  plugins in `defineConfig`. A plugin's groups come before its own entries.
- **Shared groups:** a plugin can put entries in a group that a different
  plugin declares.
- **One declaration:** two plugins cannot declare the same `id`. Boot throws
  `global-nav-duplicate-group`.
- **Empty groups:** a group with no entry to show does not render.

## `home.panel`

`home.panel` is the list of panels on Home, the landing screen of the admin.
Each panel is a `HomePanelContribution` (`core/slot/contract.ts`):

| Property | Type | Role |
|---|---|---|
| `id` | `string` | The identity of the panel. It must not be empty, and it must be unique across all plugins. |
| `component` | `ComponentType<HomePanelContext>` | The panel. Home renders it and gives it the width tier. |
| `column` | `'main' \| 'side'` | The column of the panel on a desktop. |
| `order` | `number` | The position in the column on a desktop. A lower number comes first. The default is `0`. |
| `narrowOrder` | `number` | The position in the one column of a tablet and a phone. The default is the value of `order`. |
| `dependsOn` | `Capability[]` | The capabilities the panel needs. If no installed plugin provides one of them, Home does not mount the panel. |

`HomePanelContext` is `{ tier }`. `tier` is `'desktop'`, `'tablet'` or
`'phone'`. It follows the width of the window: a phone is less than 768px, a
tablet is from 768px to 1279px, and a desktop is 1280px or more.

On a desktop, Home has two columns: `main`, and a `side` column with a fixed
width. On a tablet and a phone, Home has one column, and `narrowOrder` sets
the position of each panel in it.

The core plugin `tina:home:core` contributes the default panels:

| `id` | Panel | `column` | `order` | `narrowOrder` |
|---|---|---|---|---|
| `collections` | Collections | `main` | `10` | `30` |
| `recent-documents` | Recent documents | `side` | `10` | `20` |
| `branch` | Branch | `side` | `20` | `10` |

The Branch panel renders nothing unless the content provider has `branches`.
The id `globals` is reserved for a default panel that v4 does not supply yet.

### A custom panel

A panel is a React component. It gets its own data and shows its own states.
Use `HomePanelTray` from `@tinacms/ui` for the frame, so the panel looks like
the default panels. The tray shows placeholder rows for `loading`. It shows
the sentence in `problem` in place of the content, with a Retry button when
you set `onRetry`. To navigate, use `useAdminRoute` from
`@tinacms/tinacms/admin`.

```tsx
import { HomePanelTray } from '@tinacms/ui/components/home-panel-tray';
import { definePlugin } from '@tinacms/tinacms';
import { useAdminRoute } from '@tinacms/tinacms/admin';
import {
  type HomePanelContext,
  defineClientPlugin,
} from '@tinacms/tinacms/client';

function BuildsPanel({ tier }: HomePanelContext) {
  const { builds, isLoading, error, retry } = useBuilds();
  const { navigate } = useAdminRoute();
  return (
    <HomePanelTray
      title='Builds'
      count={builds ? String(builds.length) : undefined}
      loading={isLoading}
      problem={error ? "Couldn't load the builds." : undefined}
      onRetry={retry}
    >
      <ul>
        {(builds ?? []).slice(0, tier === 'desktop' ? 8 : 3).map((build) => (
          <li key={build.id}>
            <button
              type='button'
              onClick={() => navigate({ view: 'screen', screen: 'builds', segments: [build.id] })}
            >
              {build.title}
            </button>
          </li>
        ))}
      </ul>
    </HomePanelTray>
  );
}

export const buildsPlugin = definePlugin({
  name: 'example:builds',
  client: async () => ({
    default: defineClientPlugin({
      slots: {
        'home.panel': [
          {
            id: 'example.builds',
            component: BuildsPanel,
            column: 'side',
            order: 15,
            narrowOrder: 25,
          },
        ],
      },
    }),
  }),
});
```

With `order: 15`, the panel is between Recent documents and Branch in the
side column. With `narrowOrder: 25`, it is between Recent documents and
Collections in the one column.

For data that the setup does not have, set `problem` and omit `onRetry`. The
tray then shows the sentence with no Retry button.

### Rules

- **Order:** Home sorts the panels of a column by `order`, and the one column
  by `narrowOrder`. Panels with the same value keep the order of the plugins
  in `defineConfig`, then the order in the `home.panel` array.
- **Ids:** an empty `id` throws `home-panel-no-id` at boot. An `id` that a
  different panel has throws `home-panel-duplicate-id`, and the message names
  the two plugins. This includes the ids of the default panels. Give a
  third-party id a prefix (`acme.builds`).
- **Columns:** a `column` that is not `main` or `side` throws
  `home-panel-unknown-column`.
- **Numbers:** an `order` that is not a finite number throws
  `home-panel-order-not-finite`. A `narrowOrder` that is not a finite number
  throws `home-panel-narrow-order-not-finite`.
- **Each error names the plugin** that contributes the panel.
- **Dependencies:** Home does not mount a panel with a `dependsOn` capability
  that no installed plugin provides. The panel leaves no empty frame. Boot
  still does the id, column and number checks on it.
- **Titles:** the title of a tray is the name of its region for a screen
  reader. Give each panel a different title.
- **Failures:** if a panel throws while it renders, Home shows "Couldn't show
  this panel." with a Retry button in its place. The other panels continue to
  operate.
- **Add and order only:** a plugin cannot remove or replace a default panel.

## Read the nav

`useGlobalNav()` (`@tinacms/tinacms/admin`) gives a list of
`GlobalNavSection` values after the filter and the sort. A section is a group
with its entries, or a run of entries without a group (`group` is
`undefined`). The admin sidebar renders one menu for each section.

## Not supported yet

- **Permissions:** ADR-013 gates a contribution with
  `requires: { permission }`. v4 has no permission system yet (ADR-008). Thus
  every entry and every panel renders for every user.
