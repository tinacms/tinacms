import type { FieldDescriptor } from './field/contract';

export type Capability = 'field' | 'content' | 'auth' | 'media' | 'search';

export interface CapabilityOverride {
  capability: Capability;
  key: string;
}

export interface ClientSegment {
  field?: FieldDescriptor;
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
