import type { StoreApi } from 'zustand';
import type { FieldDescriptor } from './field/contract';
import { invariant } from './invariant';
import type { AdminScreen } from './screen/contract';

export type Capability = 'field' | 'content' | 'auth' | 'media' | 'search';

export const FIELD_CAPABILITY = 'field' as const satisfies Capability;

export const AUTH_CAPABILITY = 'auth' as const satisfies Capability;

// TODO(v4): derive this list from per-capability descriptors.
export const SINGLETON_SLICE_CAPABILITIES = [
  'auth',
  'content',
  'media',
  'search',
] as const satisfies readonly Capability[];

export type SingletonSliceCapability =
  (typeof SINGLETON_SLICE_CAPABILITIES)[number];

export const isSingletonSliceCapability = (
  value: string
): value is SingletonSliceCapability =>
  (SINGLETON_SLICE_CAPABILITIES as readonly string[]).includes(value);

export interface FieldProvision {
  type: string;
  contractVersion: number;
}

export type CapabilityOverride =
  | { capability: typeof FIELD_CAPABILITY; key: string }
  | { capability: SingletonSliceCapability };

export type TinaStoreState = Record<string, SliceState>;

export type SliceState = Record<string, unknown>;

export type SliceSet = (
  partial: Partial<SliceState> | ((current: SliceState) => Partial<SliceState>),
  replace?: boolean,
  action?: string
) => void;

export type ClientSlice = (
  set: SliceSet,
  get: StoreApi<TinaStoreState>['getState']
) => SliceState;

export interface ClientSegment {
  field?: FieldDescriptor;
  slice?: ClientSlice;
  screens?: AdminScreen[];
}

export type ServerOp = (input: never) => Promise<unknown>;

export type ServerSegment = Record<string, ServerOp>;

export interface ResolvedServerSegment {
  manifest: PluginManifest;
  ops: ServerSegment;
}

export interface ResolvedSegment {
  manifest: PluginManifest;
  segment: ClientSegment;
}

export const resolveClientSegments = async (
  plugins: PluginManifest[]
): Promise<ResolvedSegment[]> => {
  const resolved: ResolvedSegment[] = [];
  for (const manifest of plugins) {
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

export interface PluginManifestInput {
  name: string;
  provides?: Capability[];
  dependsOn?: Capability[];
  field?: FieldProvision;
  client?: () => Promise<{ default: ClientSegment }>;
  server?: () => Promise<{ default: ServerSegment }>;
  // TODO(ADR-008 §3): type `permissions` against codegen's Permission union once it lands.
  permissions?: { name: string; description?: string }[];
  requires?: { permission: string };
  overrides?: CapabilityOverride[];
  onInit?: () => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
}

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
