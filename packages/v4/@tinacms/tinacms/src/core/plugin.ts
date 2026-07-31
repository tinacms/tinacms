import type { StoreApi } from 'zustand';
import type { FieldDescriptor } from './field/contract';
import { invariant } from './invariant';

export type Capability = 'field' | 'content' | 'auth' | 'media' | 'search';

// The one keyed capability (many field types, one registry). Named so runtime checks
// reference the constant, not a repeated literal.
export const FIELD_CAPABILITY = 'field' as const satisfies Capability;

// The capability whose provider additionally carries the RPC transport hooks
// (server/index.ts AuthTransportHooks) — same naming rule as FIELD_CAPABILITY.
export const AUTH_CAPABILITY = 'auth' as const satisfies Capability;

// Capabilities whose provider owns a single client store namespace — its slice mounts at the
// capability key (store-architecture.md), not the plugin name. The one place this
// categorisation lives, so the store composer reads it here instead of re-listing. `content`
// is included though it has no client slice yet; `field` is absent (keyed, and Form state is
// core, ADR-010).
//
// TODO(v4): fold into a richer per-capability descriptor (kind: 'singleton-slice' | 'keyed' |
// 'backend') and derive this list from that once more capabilities land.
export const SINGLETON_SLICE_CAPABILITIES = [
  'auth',
  'content',
  'media',
  'search',
] as const satisfies readonly Capability[];

export type SingletonSliceCapability =
  (typeof SINGLETON_SLICE_CAPABILITIES)[number];

// The one guard over that list; takes a raw string so namespace checks use it too.
export const isSingletonSliceCapability = (
  value: string
): value is SingletonSliceCapability =>
  (SINGLETON_SLICE_CAPABILITIES as readonly string[]).includes(value);

// A plugin's declaration that its segment replaces a built-in. `field` is keyed, so its
// override names the field type; singletons have exactly one slot, so the union forbids
// a dead `key` on them.
export type CapabilityOverride =
  | { capability: typeof FIELD_CAPABILITY; key: string }
  | { capability: SingletonSliceCapability };

// The whole boot-composed client store: a flat bag of namespaces, each holding one
// slice's state, open-shaped because plugins register arbitrary namespaces at boot.
// Core and plugin slices both mount here; a slice reads peers from it. Single
// definition — the store modules import it from here.
export type TinaStoreState = Record<string, SliceState>;

// One slice's own state: the object a slice returns and mounts at its namespace — its
// data fields plus its action functions, e.g. `{ items: [], add: (item) => … }`. Keys
// and value shapes are the slice author's to define, hence `Record<string, unknown>`.
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
  get: StoreApi<TinaStoreState>['getState']
) => SliceState;

export interface ClientSegment {
  field?: FieldDescriptor;
  slice?: ClientSlice;
}

// One server-segment operation (ADR-007): a flat `(input) => Promise<result>` record is
// the whole contract — the same shape `import type` carries to the client for the typed
// RPC proxy. `never` keeps every concrete op assignable (parameter contravariance)
// without reaching for `any`; the transport casts at the single dispatch site.
export type ServerOp = (input: never) => Promise<unknown>;

export type ServerSegment = Record<string, ServerOp>;

// A manifest paired with its loaded server segment — what the RPC handler composes
// (rpc/handler.ts), symmetric with ResolvedSegment on the client side.
export interface ResolvedServerSegment {
  manifest: PluginManifest;
  ops: ServerSegment;
}

// A manifest paired with its loaded client segment — the boot-resolved unit both
// registries (field types, store slices) compose from.
export interface ResolvedSegment {
  manifest: PluginManifest;
  segment: ClientSegment;
}

// Load every plugin's client segment once. The one boot-time resolution pass — its
// result feeds both createFieldRegistry and createTinaStore so the two compose from
// the same segments and can't diverge.
export const resolveClientSegments = async (
  plugins: PluginManifest[]
): Promise<ResolvedSegment[]> => {
  const resolved: ResolvedSegment[] = [];
  for (const manifest of plugins) {
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

// The authoring shape passed to definePlugin: the list fields are optional so a
// plugin only spells out what it uses. definePlugin normalizes them, so every
// consumer works with PluginManifest below and never guards with `?? []`.
export interface PluginManifestInput {
  name: string;
  // Honored today: `name`, `client`, `server`, `provides` (mount key), `dependsOn`
  // (graph order, core/resolve.ts), `overrides`, and `requires` (RPC transport gate).
  // `permissions` declarations await codegen's typed Permission union (ADR-008 §3).
  provides?: Capability[];
  dependsOn?: Capability[];
  client?: () => Promise<{ default: ClientSegment }>;
  server?: () => Promise<{ default: ServerSegment }>;
  permissions?: { name: string; description?: string }[];
  requires?: { permission: string };
  overrides?: CapabilityOverride[];
  // Plugin-lifecycle (ADR-006), run once per runtime boot in dependency order
  // (core/resolve.ts initializePlugins) — not per UI instance. No context argument
  // yet: the intentionally-narrow PluginInitContext (resolved config, nothing else)
  // lands with defineConfig (ADR-024) and is additive for implementers.
  onInit?: () => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
}

// The normalized manifest every consumer reads: definePlugin has filled the list
// fields, so `provides`/`dependsOn`/`overrides` are always arrays (no `?? []`).
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
