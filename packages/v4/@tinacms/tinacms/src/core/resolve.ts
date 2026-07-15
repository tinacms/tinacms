import { invariant } from './invariant';
import { declaresCapabilityOverride } from './mount';
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
// conflicts are the field registry's job (createFieldRegistry). Both segment composers
// are order-independent registries — ADR-006's topological order exists solely for the
// onInit lifecycle, and its one config-shaped failure (a dependency cycle) is caught
// here with the rest.
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
          isOverride: declaresCapabilityOverride(plugin, capability),
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

  orderPluginsByDependencies(plugins);
};

// ADR-006 initialization order: every provider of a capability initializes before the
// plugins depending on it. Repeated ready-scan (Kahn's algorithm) so config order breaks
// ties and runs are deterministic; a plugin satisfying its own dependency is not an
// edge. A cycle cannot be ordered — hard error naming the members, same philosophy as
// capability conflicts: nothing is silently picked.
// ponytail: O(n²) ready-scan — plugin lists are tens, not thousands.
const orderPluginsByDependencies = (
  plugins: PluginManifest[]
): PluginManifest[] => {
  const providersOf = new Map<Capability, PluginManifest[]>();
  for (const plugin of plugins) {
    for (const capability of plugin.provides ?? []) {
      providersOf.set(capability, [
        ...(providersOf.get(capability) ?? []),
        plugin,
      ]);
    }
  }

  const ordered: PluginManifest[] = [];
  const emitted = new Set<PluginManifest>();
  while (ordered.length < plugins.length) {
    const ready = plugins.filter(
      (plugin) =>
        !emitted.has(plugin) &&
        (plugin.dependsOn ?? []).every((capability) =>
          (providersOf.get(capability) ?? []).every(
            (provider) => provider === plugin || emitted.has(provider)
          )
        )
    );
    invariant(
      ready.length > 0,
      'capability-cycle',
      'Capability dependencies form a cycle among: ' +
        plugins
          .filter((plugin) => !emitted.has(plugin))
          .map((plugin) => `"${plugin.name}"`)
          .join(', ') +
        '. Initialization order requires an acyclic graph — break the cycle.'
    );
    for (const plugin of ready) {
      emitted.add(plugin);
      ordered.push(plugin);
    }
  }
  return ordered;
};

// The onInit lifecycle (ADR-006): run once per runtime boot, in dependency order, each
// hook awaited before the next. Returns the matching teardown — onDestroy in reverse
// order, only for plugins whose init actually ran. A mid-sequence failure tears those
// down first (a poller registered by an earlier onInit must not outlive a failed boot),
// then rethrows the original cause.
export const initializePlugins = async (
  plugins: PluginManifest[]
): Promise<() => Promise<void>> => {
  const initialized: PluginManifest[] = [];
  // Idempotent (drains the list, so a second call is a no-op) and abort-proof:
  // one throwing onDestroy must not skip the remaining teardowns — every hook
  // runs, then the first failure rethrows so callers can still surface it.
  const destroyInitialized = async () => {
    const failures: unknown[] = [];
    for (const plugin of initialized.splice(0).reverse()) {
      try {
        await plugin.onDestroy?.();
      } catch (cause) {
        failures.push(cause);
      }
    }
    if (failures.length > 0) throw failures[0];
  };
  for (const plugin of orderPluginsByDependencies(plugins)) {
    try {
      await plugin.onInit?.();
      initialized.push(plugin);
    } catch (cause) {
      await destroyInitialized().catch(() => {});
      throw cause;
    }
  }
  return destroyInitialized;
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
