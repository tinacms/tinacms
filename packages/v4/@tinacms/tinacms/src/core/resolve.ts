import { invariant } from './invariant';
import {
  REGISTRY_CONFLICTS,
  type RegistryConflict,
  composeOverridableRegistry,
} from './overridable-registry';
import {
  FIELD_CAPABILITY,
  type PluginManifest,
  type ResolvedServerSegment,
} from './plugin';

// Load every plugin's server segment once — the server-side twin of
// resolveClientSegments, consumed by the RPC handler after the graph is validated.
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
// Validates everything a broken config can get wrong (duplicate names,
// singleton-capability conflicts, missing providers) before any segment is imported,
// so a bad config never half-boots.
//
// `field` is the keyed capability (ADR-009): many providers are legal, and per-type
// conflicts are the field registry's job (createFieldRegistry). ADR-006's topological
// init order is deliberately NOT computed here — nothing consumes ordering until the
// deferred onInit lifecycle lands; both composers are order-independent registries.
export const validateCapabilityGraph = (plugins: PluginManifest[]): void => {
  const names = new Set<string>();
  for (const plugin of plugins) {
    invariant(
      !names.has(plugin.name),
      'plugin-duplicate-name',
      `Two plugins are both named "${plugin.name}". Plugin names are identities ` +
        'and must be unique.'
    );
    names.add(plugin.name);
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

  const provided = new Set(plugins.flatMap((plugin) => plugin.provides ?? []));
  for (const plugin of plugins) {
    for (const capability of plugin.dependsOn ?? []) {
      invariant(
        provided.has(capability),
        'capability-no-provider',
        `Plugin "${plugin.name}" depends on the "${capability}" capability, but ` +
          'no installed plugin provides it.'
      );
    }
  }
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
