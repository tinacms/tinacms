import type { StoreApi } from 'zustand';
import type { FieldDescriptor } from './field/contract';

export type Capability = 'field' | 'content' | 'auth' | 'media' | 'search';

// Capabilities whose provider owns a single, well-known client store namespace — its slice
// mounts at the capability key (store-architecture.md), not the plugin name. Declared here
// next to `Capability` as the one place this categorisation lives, so the store composer and
// anything else that needs it read from here instead of re-listing capabilities.
//
// `content` is a singleton (one content backend per app); it has no client slice today so it
// changes nothing yet, but a provider that grows client state would mount it at `content`.
// `field` is absent — it's keyed (many field types) and Form state is core (ADR-010).
//
// TODO(v4): fold this into a richer per-capability descriptor (kind: 'singleton-slice' |
// 'keyed' | 'backend') and derive this list from that once more capabilities land.
export const SINGLETON_SLICE_CAPABILITIES = [
  'auth',
  'content',
  'media',
  'search',
] as const satisfies readonly Capability[];

export type SingletonSliceCapability =
  (typeof SINGLETON_SLICE_CAPABILITIES)[number];

// A plugin's declaration that its segment replaces a built-in. `field` is keyed, so the
// override names which field type it replaces; the singleton capabilities have exactly one
// slot, so no key is needed — and none may be given. Modelled as a union so `key` is only
// reachable (and only required) after narrowing to `'field'`, and a singleton override
// can't carry a dead key.
export type CapabilityOverride =
  | { capability: 'field'; key: string }
  | { capability: SingletonSliceCapability };

// The whole boot-composed client store, seen as a flat bag of namespaces. Open-shaped
// because plugins register arbitrary namespaces at boot; core slices (ui/branch/documents)
// and plugin slices both mount here, and a slice reads its own state and its peers from
// it. This is the single definition — store/slice.ts re-exports it.
export type TinaStoreState = Record<string, unknown>;

// One slice's own state: the bag of values + actions it mounts at its namespace.
export type SliceState = Record<string, unknown>;

// The `set` a slice is handed, scoped to its own namespace. It takes either the next
// partial state or an updater computing it from the slice's current state (Zustand's two
// `set` forms), plus an optional devtools action label. Writes land under the slice's
// namespace only — never the whole store.
export type SliceSet = (
  partial: Partial<SliceState> | ((current: SliceState) => Partial<SliceState>),
  replace?: boolean,
  action?: string
) => void;

// A client segment's store slice (store-architecture.md): given its namespace-scoped `set`
// and the whole-store `get`, it returns the state + actions the runtime mounts at the
// plugin's namespace. `get` reads peers by namespace (`get().auth.user`). It's deliberately
// middleware-agnostic — slices never see the host's devtools/persist. Field plugins
// contribute none: Form state is core (ADR-010).
export type ClientSlice = (
  set: SliceSet,
  get: StoreApi<TinaStoreState>['getState'],
  api: StoreApi<TinaStoreState>
) => SliceState;

export interface ClientSegment {
  field?: FieldDescriptor;
  slice?: ClientSlice;
}

export interface PluginManifest {
  name: string;
  // Honored today: `name`, `client`, and `overrides` (the field-capability conflict
  // rule). The rest — `provides`, `dependsOn`, `server`, `permissions`, `requires` —
  // are declared for the full plugin contract (ADR-002/006/007/008) but NOT yet
  // wired (no capability resolution, server segments, or RBAC): they're noops for now.
  provides?: Capability[];
  dependsOn?: Capability[];
  client?: () => Promise<{ default: ClientSegment }>;
  server?: () => Promise<unknown>;
  permissions?: { name: string; description?: string }[];
  requires?: { permission: string };
  overrides?: CapabilityOverride[];
}

export const definePlugin = (manifest: PluginManifest): PluginManifest =>
  manifest;
