# Custom Plugins

> **Canonical sources:** [ADR-002](../002-plugin-first-architecture.md), [ADR-006](../006-plugin-dependency-resolution.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-008](../008-authorization-permissions-roles.md); [CONTEXT.md](../CONTEXT.md) for **Plugin**, **Capability**, **Capability RPC**, **Plugin segment**.

There is only one kind of plugin in v4 — a full-stack plugin with up to two segments. There is no separate `defineFieldPlugin` / `defineFeaturePlugin` / `defineMediaPlugin`. A plugin's kind is expressed by what it `provides`.

## The shape of every plugin

```ts
import { definePlugin } from 'tinacms'

definePlugin({
  name: 'editorial-workflow',     // unique plugin identity
  provides: [],                   // capabilities this plugin satisfies (often [] for "features")
  dependsOn: ['content', 'auth'], // capabilities required to start
  client: () => import('./client'),   // optional — React + Zustand slice
  server: () => import('./server'),   // optional — operations, secrets, file access
  permissions: [
    { name: 'content:publish', description: 'Publish content to main branch' },
  ],
  requires: { permission: 'content:publish' },  // optional plugin-level gate (hides UI + ops)
  onInit?:    (ctx) => …,         // plugin-lifecycle hook, called once
  onDestroy?: (ctx) => …,
})
```

A plugin needs **at least one of `client` or `server`**. Most useful plugins have both.

## Worked example: an editorial-workflow plugin

This plugin lets editors create branches, save changes to them, and request publish via a PR. It depends on the `content` capability (the Data Layer) and `auth` (for the publish permission), provides no new capability, and adds one `content:publish` permission.

### Plugin manifest

```ts
// plugin.ts
import { definePlugin } from 'tinacms'

export default definePlugin({
  name: 'editorial-workflow',
  provides: [],                   // it's a "feature"
  dependsOn: ['content', 'auth'],
  client: () => import('./client'),
  server: () => import('./server'),
  permissions: [
    { name: 'content:publish', description: 'Open publish PR / merge to main' },
  ],
})
```

### Server segment

```ts
// server.ts
import { defineServerPlugin, protectedOp, use } from 'tinacms/server'
import { Octokit } from '@octokit/rest'

const gh = new Octokit({ auth: process.env.GITHUB_TOKEN })

export default defineServerPlugin({
  // Create a content branch on the Data Layer (delegated through `content`)
  async createBranch(input: { name: string }) {
    const content = use('content')
    return content.createBranch(input.name)
  },

  // Open a PR for the current branch — permission-gated
  requestPublish: protectedOp({ permission: 'content:publish' }, async (input: { branch: string }) => {
    const pr = await gh.pulls.create({
      owner: REPO_OWNER, repo: REPO_NAME,
      head: input.branch, base: 'main',
      title: `Publish: ${input.branch}`,
    })
    return { url: pr.data.html_url, number: pr.data.number }
  }),
})
```

Note `use('content')` — the **server→server capability accessor**. The workflow plugin doesn't care which Data Layer implementation provides `content`; it just calls into the capability. ([ADR-007](../007-full-stack-plugins-client-backend-segments.md))

### Client segment

```ts
// client.ts
import { defineClientPlugin, server } from 'tinacms'

export default defineClientPlugin({
  // namespaced slice — mounted at store.workflow at boot (plugin name → slice name)
  slice: (set, get) => ({
    activePR: null,

    async startEditing(branchName: string) {
      const branch = await server['editorial-workflow'].createBranch({ name: branchName })
      // tell the branch slice (provided by core) which branch we're on
      get().branch.setCurrent(branch.name)
    },

    async requestPublish() {
      const current = get().branch.current
      const pr = await server['editorial-workflow'].requestPublish({ branch: current })
      set({ activePR: pr })
    },
  }),

  components: { WorkflowToolbar, PublishButton },
})
```

### Usage

```ts
import { defineConfig } from 'tinacms'
import { tinaCloud } from '@tinacms/cloud'
import { editorialWorkflow } from './plugins/editorial-workflow'

export default defineConfig({
  plugins: [
    tinaCloud(),                  // provides: ['content', 'auth', 'media']
    editorialWorkflow(),          // dependsOn: ['content', 'auth']
  ],
})
```

## The four communication channels

A custom plugin uses these and nothing else:

| From → To | Mechanism | When |
|---|---|---|
| client → client | namespaced slice — `get().auth.user`, `get().branch.current` | reading another plugin's state |
| client → server | **Capability RPC** — `server.x.y(...)` | calling any server segment |
| server → server | `use('cap')` | one server segment composing another |
| server → client | none in v4 core | the server only returns values |

No event bus. No `context.getPlugin(name)`. No runtime `store.extend()`. ([ADR-003 amendment](../003-zustand-state-management.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md))

## Depending on capabilities, not plugin names

```ts
// GOOD
definePlugin({
  name: 'my-plugin',
  dependsOn: ['media'],           // any media provider
})

// WRONG — does not work
definePlugin({
  name: 'my-plugin',
  dependsOn: ['s3-media'],        // ← plugin name, not capability
})
```

This is the swap-an-implementation property: a project can replace `s3-media` with `cloudinary-media` and your plugin keeps working. ([ADR-006](../006-plugin-dependency-resolution.md))

## Authorization

All server operations are protected by default. Three tiers:

```ts
import { protectedOp, publicOp } from 'tinacms/server'

export default defineServerPlugin({
  // authenticated session required (default)
  async ping(input) { … },

  // authenticated + holding a specific permission
  delete: protectedOp({ permission: 'thing:delete' }, async (input) => { … }),

  // no auth required — `grep publicOp` lists every public endpoint
  health: publicOp(async () => ({ ok: true })),
})
```

Declare your plugin's permissions in the manifest's `permissions` array; codegen aggregates them into a typed `Permission` union. New permissions are granted to **nobody** by default (except `admin`). ([ADR-008](../008-authorization-permissions-roles.md))

## Lifecycle hooks

`onInit` and `onDestroy` are **plugin-lifecycle** — called once when the plugin loads/unloads, *not* per UI instance. Use them for one-time setup (e.g. registering a background poller in the server segment). Per-instance behaviour (field activation, form subscription) lives inside components and uses the hooks-as-subscriptions model. ([ADR-009 §4](../009-field-plugins.md), [ADR-010 §4](../010-form-state-model.md))

## When a plugin has no client

A pure server-side plugin (e.g. an audit logger that subscribes to content-write events) has no `client` field — it ships nothing to the browser bundle.

```ts
definePlugin({
  name: 'audit-log',
  provides: ['audit-log'],
  dependsOn: ['content'],
  server: () => import('./server'),
})
```

## When a plugin has no server

A purely-UI plugin (e.g. a theme override, a custom toolbar button) has no `server` field. It runs only in the browser.

```ts
definePlugin({
  name: 'dark-theme-toggle',
  provides: [],
  client: () => import('./client'),
})
```

## Publishing as a package

The whole plugin — manifest + lazy segments + types — is one npm package:

```
my-plugin/
├── package.json
├── plugin.ts          ← exports default definePlugin({ … })
├── client.ts          ← exports default defineClientPlugin({ … })
└── server.ts          ← exports default defineServerPlugin({ … })
```

The user installs and registers it with one line:

```ts
defineConfig({
  plugins: [myPlugin({ option: 'value' })],
})
```

This single-artifact shareability is the central reason for the full-stack plugin model. ([ADR-007 Context](../007-full-stack-plugins-client-backend-segments.md))

## Constraints

- **Server segments need a host.** Static-export sites with no server runtime can only use client-only plugins. (Open question in CONTEXT.md.)
- **Type-only imports across segments.** Anything the client imports from the server *must* be `import type` — otherwise the bundler pulls server code into the browser. The runtime/lint enforces this.
- **The static plugin list is the universe.** Only plugins explicitly listed in `defineConfig({ plugins: [...] })` participate. A plugin cannot inject itself into the graph. ([ADR-006](../006-plugin-dependency-resolution.md))

## Related

- [ADR-002](../002-plugin-first-architecture.md), [ADR-006](../006-plugin-dependency-resolution.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-008](../008-authorization-permissions-roles.md)
- [Plugin System](../architecture/plugin-system.md)
- [Media](./media-plugins.md), [Search](./search-plugins.md), [Auth](./auth-plugins.md), [Field](./field-plugins.md) plugin specifics
