# Internal APIs

> **Canonical sources:** [Plugin System](../architecture/plugin-system.md); [ADR-002](../002-plugin-first-architecture.md), [ADR-006](../006-plugin-dependency-resolution.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-008](../008-authorization-permissions-roles.md), [ADR-010](../010-form-state-model.md).

The plugin-author-facing API surfaces. Application-developer surfaces are in [Public API](./public-api.md).

## What's no longer here

If you used pre-May v4 docs you may have seen `ModuleContext`, `PluginContext.getPlugin('name')`, `registerPlugin()`, `EventBus`, `context.store.extend()`, etc. They are all gone. The replacements:

| Old | Replacement |
|---|---|
| `context.getPlugin('s3-media')` | namespaced slice read (`get().media.*`) or RPC (`server.media.*`) |
| `context.getModule(name)` | n/a — modules removed ([ADR-006](../006-plugin-dependency-resolution.md)) |
| `context.bus.on('document.save', …)` | Zustand subscription, or `use('cap')` composition on the server |
| `context.bus.emit('…')` | n/a — no event bus |
| `context.registerPlugin(plugin)` | n/a — only `defineConfig({ plugins })` registers |
| `context.store.extend(slice)` | declare slice on the client segment at boot ([ADR-003 amendment](../003-zustand-state-management.md)) |
| `context.store.addMiddleware(mw)` | declare middleware in `defineConfig({ middleware })` at boot |
| `context.storage: Map` | plugin holds its own state in its slice, or persists via the plugin's own storage |

## Plugin manifest

```ts
import { definePlugin } from 'tinacms'

definePlugin({
  name: string                              // unique plugin identity
  provides: Capability[]                    // capabilities satisfied (incl. keyed entries for `field`)
  dependsOn: Capability[]                   // capabilities required to start
  client?: () => Promise<ClientModule>      // lazy import of the client segment
  server?: () => Promise<ServerModule>      // lazy import of the server segment
  permissions?: PermissionDecl[]            // declared permissions; aggregated by codegen
  requires?: { permission: Permission }     // plugin-level gate (hides UI + ops)
  overrides?: OverrideDecl[]                // intentional same-key replacements
  onInit?: (ctx: PluginInitContext) => void | Promise<void>
  onDestroy?: () => void | Promise<void>
})
```

### `PluginInitContext`

Provided to `onInit`. Intentionally narrow — most plugin work happens in the segments, not in `onInit`:

```ts
interface PluginInitContext {
  config: TinaConfig            // resolved config (read-only)
  // No store handle — slices compose at boot, not in onInit
  // No getPlugin — depend on capabilities, not plugin names
  // No bus — there is no bus
}
```

## Client segment

```ts
import { defineClientPlugin } from 'tinacms/client'

defineClientPlugin({
  slice?:      (set, get) => SliceShape
  persist?:    (slice) => Partial<SliceShape>
  components?: Record<string, ComponentType>
  field?:      FieldDecl                    // when the plugin provides the `field` capability
  validators?: Record<string, ValidatorFactory>  // when the plugin provides the `validator` capability
})

type Validate<T = unknown, C = PluginValidationContext> = (value: T, context: C) => string | string[] | null
type ValidatorFactory = (...args: JsonValue[]) => Validate<unknown, FieldValidationContext>

interface PluginValidationContext {
  node: FieldSchema
  address: FieldAddress
}

interface FieldValidationContext extends PluginValidationContext {
  siblings: Record<string, unknown>
  values: Record<string, unknown>
  isEmpty: (value: unknown) => boolean
  measure: (value: unknown) => { amount: number; unit?: string } | null
}

interface FieldDecl {
  type: string                              // capability key (schema field `type`)
  Component: ComponentType
  defaultValue?: unknown | (() => unknown)
  metadata?: { layout?: 'inline' | 'block'; imageRefStrategy?: 'url' | 'path'; … }
  validate?: Validate
  isEmpty?: (value: unknown) => boolean               // answers the `required` validator
  measure?: (value: unknown) => { amount: number; unit?: string } | null
  parse?: (raw: unknown) => unknown
  format?: (value: unknown) => unknown
}
```

The slice is composed into the store **once at boot** under the namespace inferred from the plugin's `provides` (singleton capability key) or its `name` (feature plugins). See [Store Architecture](../store/store-architecture.md).

## Server segment

```ts
import { defineServerPlugin, protectedOp, publicOp, use } from 'tinacms/server'

defineServerPlugin<TOps>(ops: TOps)
```

Where `TOps` is a record of operations. The shape of `TOps` is what `import type` infers across the boundary to produce the typed `server.<plugin>.<op>(...)` proxy on the client. ([ADR-007](../007-full-stack-plugins-client-backend-segments.md))

### Authorization wrappers

```ts
protectedOp<TIn, TOut>(opts: { permission: Permission }, handler: (input: TIn) => Promise<TOut>): (input: TIn) => Promise<TOut>
publicOp<TIn, TOut>(handler: (input: TIn) => Promise<TOut>): (input: TIn) => Promise<TOut>
```

- Bare handlers are authenticated by default.
- `protectedOp` requires both auth and the named permission.
- `publicOp` is the only way to expose an unauthenticated endpoint. `grep publicOp` enumerates the public surface. ([ADR-008](../008-authorization-permissions-roles.md))

### Server→server capability accessor

```ts
use<C extends Capability>(capability: C): ServerOps<C>
```

Returns the in-process server-ops shape of whichever plugin provides `capability`. Used to compose capabilities without an HTTP hop:

```ts
defineServerPlugin({
  async indexEverything() {
    const content = use('content')
    const docs = await content.listAll()
    // …
  },
})
```

## Capability RPC client

In a client segment, `server` is a typed `Proxy` over the union of all server segments:

```ts
import { server } from 'tinacms/client'

await server.media.upload({ file, path })
await server.search.query({ q: 'tina' })
await server['editorial-workflow'].requestPublish({ branch })
```

The `Proxy` turns each property access + call into a single `fetch` to the mounted handler. Types come from each server segment's exported shape via `import type` — no codegen, no shared interface. ([ADR-007](../007-full-stack-plugins-client-backend-segments.md))

## React hooks for plugin authors

(For full list see [Public API](./public-api.md#react-api-tinacmsreact).)

Address-keyed Form hooks — *only* available inside field plugin Components, where the runtime supplies a Field address via context:

```ts
useFieldAddress(): FieldAddress
useFieldValue<T>(address: FieldAddress): [T, (v: T) => void]
useFieldErrors(address: FieldAddress): string[]
useFieldActivation(handler: () => void): void
useSiblingValue<T>(address: FieldAddress, siblingName: string): T
useChildKeys(address: FieldAddress): string[]
useFormActions(): {
  addItem: (parent: FieldAddress, value?: unknown) => void
  removeItem: (parent: FieldAddress, key: string) => void
  moveItem: (parent: FieldAddress, fromKey: string, toIndex: number) => void
  duplicateItem: (parent: FieldAddress, key: string) => void
}
```

`useFormActions` is the **single set of atomic structural operations** ADR-010 §6 mandates. No plugin pokes the form store directly.

## Per-framework adapter contract

A framework adapter mounts the runtime-composed RPC handler:

```ts
function mountHandler(config: TinaConfig): {
  GET: (req: FrameworkRequest) => FrameworkResponse
  POST: (req: FrameworkRequest) => FrameworkResponse
  // … any per-framework specifics
}
```

The handler internally:

1. Resolves the plugin list and topologically sorts by capability dependencies.
2. Lazy-loads each `server` segment.
3. Wraps each operation in the auth + permission transport.
4. Routes incoming requests by `<plugin-or-capability>/<op>` to the right handler.

## What plugin code may not do

- **Mutate the store shape at runtime.** Slices compose at boot. ([ADR-003 amendment](../003-zustand-state-management.md))
- **Wrap another plugin's actions.** Subscribe with `useTinaStore.subscribe(...)` or compose server-side via `use('cap')`.
- **Reach into another plugin by name.** Depend on the capability, not the name. ([ADR-006](../006-plugin-dependency-resolution.md))
- **Bypass `useFormActions`.** Structural form ops are the only sanctioned mutation path — direct writes would corrupt the value↔structure invariant. ([ADR-010 §6](../010-form-state-model.md))
- **Branch on a child's field type in a composite.** Composites delegate. ([ADR-009 §2](../009-field-plugins.md))

## Related

- [Public API](./public-api.md)
- [Plugin System](../architecture/plugin-system.md)
- [Custom Plugins](../plugins/custom-plugins.md)
