import { invariant } from './invariant';
import {
  REGISTRY_CONFLICTS,
  type RegistryConflict,
  composeOverridableRegistry,
} from './overridable-registry';
import {
  type Capability,
  FIELD_CAPABILITY,
  type PluginManifest,
  type ResolvedServerSegment,
} from './plugin';

// Load every plugin's server segment once — the server-side twin of
// resolveClientSegments, consumed by the RPC handler after the graph pass orders and
// validates the manifests.
export const resolveServerSegments = async (
  plugins: PluginManifest[]
): Promise<ResolvedServerSegment[]> => {
  const resolved: ResolvedServerSegment[] = [];
  for (const manifest of plugins) {
    if (!manifest.server) continue;
    const serverModule = await manifest.server();
    invariant(
      serverModule?.default,
      'plugin-server-no-default',
      `Plugin "${manifest.name}" has a server segment with no default export.`
    );
    resolved.push({ manifest, ops: serverModule.default });
  }
  return resolved;
};

// ADR-006: dependency resolution over capabilities, not plugin names. Only the
// config-listed plugins participate — a plugin cannot inject itself into the graph.
// Validates the whole graph up front (duplicate names, singleton-capability conflicts,
// missing providers, cycles) and returns the manifests in initialization order:
// providers before their dependents, input order preserved among independents.
//
// `field` is the keyed capability (ADR-009): many providers are legal here, and per-type
// conflicts are the field registry's job (createFieldRegistry).
export const resolveCapabilityGraph = (
  plugins: PluginManifest[]
): PluginManifest[] => {
  const byName = new Map<string, PluginManifest>();
  for (const plugin of plugins) {
    invariant(
      !byName.has(plugin.name),
      'plugin-duplicate-name',
      `Two plugins are both named "${plugin.name}". Plugin names are identities ` +
        'and must be unique.'
    );
    byName.set(plugin.name, plugin);
  }

  // Singleton capabilities resolve through the same order-independent override rule as
  // field types and store slices: two bases or two overrides at one capability throw;
  // an explicit `overrides` is the only sanctioned way to replace a provider.
  composeOverridableRegistry(
    plugins.flatMap((plugin) =>
      (plugin.provides ?? [])
        .filter((capability) => capability !== FIELD_CAPABILITY)
        .map((capability) => ({
          key: capability,
          value: plugin,
          isOverride: (plugin.overrides ?? []).some(
            (override) => override.capability === capability
          ),
        }))
    ),
    capabilityConflictError
  );

  const providersByCapability = new Map<Capability, PluginManifest[]>();
  for (const plugin of plugins) {
    for (const capability of plugin.provides ?? []) {
      const providers = providersByCapability.get(capability) ?? [];
      providers.push(plugin);
      providersByCapability.set(capability, providers);
    }
  }

  // Kahn's topological sort over capability edges (provider → dependent). A missing
  // provider fails here, before any segment is imported, so a broken config never
  // half-boots.
  const blockedBy = new Map<string, number>();
  const dependentsOf = new Map<string, PluginManifest[]>();
  for (const plugin of plugins) {
    let blockers = 0;
    for (const capability of plugin.dependsOn ?? []) {
      const providers = providersByCapability.get(capability);
      invariant(
        providers,
        'capability-no-provider',
        `Plugin "${plugin.name}" depends on the "${capability}" capability, but ` +
          'no installed plugin provides it.'
      );
      for (const provider of providers) {
        if (provider === plugin) continue;
        blockers += 1;
        const dependents = dependentsOf.get(provider.name) ?? [];
        dependents.push(plugin);
        dependentsOf.set(provider.name, dependents);
      }
    }
    blockedBy.set(plugin.name, blockers);
  }

  const ready = plugins.filter((plugin) => blockedBy.get(plugin.name) === 0);
  const ordered: PluginManifest[] = [];
  for (let plugin = ready.shift(); plugin; plugin = ready.shift()) {
    ordered.push(plugin);
    for (const dependent of dependentsOf.get(plugin.name) ?? []) {
      const blockers = (blockedBy.get(dependent.name) ?? 0) - 1;
      blockedBy.set(dependent.name, blockers);
      if (blockers === 0) ready.push(dependent);
    }
  }

  invariant(
    ordered.length === plugins.length,
    'capability-cycle',
    'Capability dependencies form a cycle between: ' +
      plugins
        .filter((plugin) => !ordered.includes(plugin))
        .map((plugin) => `"${plugin.name}"`)
        .join(', ') +
      '.'
  );
  return ordered;
};

const capabilityConflictError = (
  conflict: RegistryConflict,
  capability: string
): Error => {
  if (conflict === REGISTRY_CONFLICTS.duplicateOverride) {
    return new Error(
      `Two plugins both declare an \`overrides\` for the "${capability}" ` +
        'capability. Only one may replace the built-in.'
    );
  }
  return new Error(
    `Two plugins provide the "${capability}" capability. Load order never picks ` +
      'a winner: remove one, or declare `overrides` on the intended replacement.'
  );
};
