import type { StoreApi } from 'zustand';
import type { FieldDescriptor } from './field/contract';
import { invariant } from './invariant';
import type { AdminPage } from './page/contract';

export type Capability = 'field' | 'content' | 'auth' | 'media' | 'search';

// The one keyed capability. There are many field types, but one registry. Runtime
// checks read this constant instead of a repeated literal.
export const FIELD_CAPABILITY = 'field' as const satisfies Capability;

// The provider of this capability also carries the RPC transport hooks. Refer to
// AuthTransportHooks in server/index.ts. The naming rule is the same as
// FIELD_CAPABILITY.
export const AUTH_CAPABILITY = 'auth' as const satisfies Capability;

// The provider of each of these capabilities owns one client store namespace. Its slice
// mounts at the capability key, and not at the plugin name. Refer to
// store-architecture.md. The store composer reads this list instead of repeating it.
// The list holds `content`, which has no client slice yet. It does not hold `field`,
// because `field` is keyed and the form state is core (ADR-010).
//
// TODO(v4): give each capability a descriptor with a kind of 'singleton-slice',
// 'keyed', or 'backend'. Then derive this list from those descriptors.
export const SINGLETON_SLICE_CAPABILITIES = [
  'auth',
  'content',
  'media',
  'search',
] as const satisfies readonly Capability[];

export type SingletonSliceCapability =
  (typeof SINGLETON_SLICE_CAPABILITIES)[number];

// The one guard over that list. It takes a plain string, so the namespace checks can
// also use it.
export const isSingletonSliceCapability = (
  value: string
): value is SingletonSliceCapability =>
  (SINGLETON_SLICE_CAPABILITIES as readonly string[]).includes(value);

// The static half of a `field` provider. It holds the schema type the provider renders,
// and the contract version of the shape of that type. Both sit on the manifest, and not
// on the descriptor, because the schema compile runs in Node. A read of the type key
// from the client segment would pull React into the build. For rich text it would also
// pull in Plate (ADR-016 §2).
export interface FieldProvision {
  type: string;
  // Only a breaking change to the schema shape of this field type increases this
  // number. A committed lock that holds an older major version stops the build. It
  // does not break quietly (ADR-016 §3).
  contractVersion: number;
}

// A declaration that the segment of a plugin replaces a built-in segment. The `field`
// capability is keyed, so its override names the field type. A singleton capability has
// one slot, so the union gives it no key.
export type CapabilityOverride =
  | { capability: typeof FIELD_CAPABILITY; key: string }
  | { capability: SingletonSliceCapability };

// The full client store, composed at boot. It is a flat set of namespaces, and each
// namespace holds the state of one slice. The shape is open, because a plugin can
// register any namespace at boot. Core slices and plugin slices both mount here, and a
// slice reads its peers from here. The store modules import this one definition.
export type TinaStoreState = Record<string, SliceState>;

// The state of one slice. The slice returns this object, and the runtime mounts it at
// the namespace of the slice. It holds the data fields of the slice and its action
// functions, for example `{ items: [], add: (item) => … }`. The author of the slice
// defines the keys and the value shapes.
export type SliceState = Record<string, unknown>;

// The `set` function of a slice, scoped to the namespace of that slice. It takes the
// next partial state, or a function that computes the next state from the current
// state. These are the two forms of `set` in Zustand. It also takes a devtools action
// label. A write lands in the namespace of the slice only, and never in the whole store.
export type SliceSet = (
  partial: Partial<SliceState> | ((current: SliceState) => Partial<SliceState>),
  replace?: boolean,
  action?: string
) => void;

// The store slice of a client segment. Refer to store-architecture.md. It receives the
// scoped `set` and the whole-store `get`, and it returns the state and the actions. The
// runtime mounts them at the namespace of the plugin. The `get` function reads the peers
// by namespace, for example `get().auth.user`. A slice never sees the devtools
// middleware or the persist middleware of the host. A field plugin supplies no slice,
// because the form state is core (ADR-010).
export type ClientSlice = (
  set: SliceSet,
  get: StoreApi<TinaStoreState>['getState']
) => SliceState;

export interface ClientSegment {
  field?: FieldDescriptor;
  slice?: ClientSlice;
  // Screens this plugin adds to the admin, beside the collection views the schema
  // generates. They compose into the page registry at boot. Refer to core/page/registry.
  // A plugin declares no capability for these: a page is a contribution, and not a slot
  // that one provider fills.
  pages?: AdminPage[];
}

// One operation in a server segment (ADR-007). The whole contract is a flat record of
// `(input) => Promise<result>` functions. An `import type` carries the same shape to the
// client for the typed RPC proxy. The `never` input keeps every concrete operation
// assignable, and it avoids `any`. The transport casts the input at its one dispatch
// site.
export type ServerOp = (input: never) => Promise<unknown>;

export type ServerSegment = Record<string, ServerOp>;

// A manifest with its loaded server segment. The RPC handler composes these in
// rpc/handler.ts. ResolvedSegment is the equivalent shape on the client.
export interface ResolvedServerSegment {
  manifest: PluginManifest;
  ops: ServerSegment;
}

// A manifest with its loaded client segment. Both registries compose from these units:
// the field type registry and the store slice registry.
export interface ResolvedSegment {
  manifest: PluginManifest;
  segment: ClientSegment;
}

// Load the client segment of each plugin once. This is the one resolution pass at boot.
// Its result feeds createFieldRegistry and createTinaStore, so the two compose from the
// same segments and cannot diverge.
export const resolveClientSegments = async (
  plugins: PluginManifest[]
): Promise<ResolvedSegment[]> => {
  const resolved: ResolvedSegment[] = [];
  for (const manifest of plugins) {
    // A field provider with no client segment never reaches the registry's paired
    // check below, so it would compile into the lock and then resolve to nothing at
    // render. Caught here, where the segment list is built.
    invariant(
      !(manifest.field && !manifest.client),
      'field-plugin-no-client',
      `Plugin "${manifest.name}" declares the field type "${manifest.field?.type}" but has no client segment to render it.`
    );
    if (!manifest.client) continue;
    const clientModule = await manifest.client();
    invariant(
      clientModule?.default,
      'plugin-client-no-default',
      `Plugin "${manifest.name}" has a client segment with no default export.`
    );
    resolved.push({ manifest, segment: clientModule.default });
  }
  return resolved;
};

// The shape an author passes to definePlugin. The list fields are optional, so a plugin
// declares only what it uses. definePlugin fills them in, so every consumer reads the
// PluginManifest below and needs no `?? []` guard.
export interface PluginManifestInput {
  name: string;
  // The runtime reads `name`, `client`, `server`, `provides` for the mount key,
  // `dependsOn` for the graph order in core/resolve.ts, `overrides`, and `requires` for
  // the RPC transport gate. It does not read `permissions` yet. That field waits for
  // the typed Permission union from codegen (ADR-008 §3).
  provides?: Capability[];
  dependsOn?: Capability[];
  // A `field` provider must set this field, and no other plugin may set it. It names
  // the keyed slot that the plugin fills. The client segment supplies the descriptor
  // for that slot.
  field?: FieldProvision;
  client?: () => Promise<{ default: ClientSegment }>;
  server?: () => Promise<{ default: ServerSegment }>;
  permissions?: { name: string; description?: string }[];
  requires?: { permission: string };
  overrides?: CapabilityOverride[];
  // The plugin lifecycle (ADR-006). The runtime runs these once at each boot, in
  // dependency order. Refer to initializePlugins in core/resolve.ts. It does not run
  // them for each UI instance. They take no context argument yet. PluginInitContext
  // carries the resolved config and nothing else. It arrives with defineConfig
  // (ADR-024), and it adds to this shape without a breaking change.
  onInit?: () => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
}

// The normalized manifest that every consumer reads. definePlugin has filled the list
// fields, so `provides`, `dependsOn`, and `overrides` are always arrays.
export interface PluginManifest extends PluginManifestInput {
  provides: Capability[];
  dependsOn: Capability[];
  overrides: CapabilityOverride[];
}

export const definePlugin = (
  manifest: PluginManifestInput
): PluginManifest => ({
  ...manifest,
  provides: manifest.provides ?? [],
  dependsOn: manifest.dependsOn ?? [],
  overrides: manifest.overrides ?? [],
});
