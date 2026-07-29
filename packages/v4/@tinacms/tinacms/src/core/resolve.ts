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

// Load the server segment of each plugin once. This is the server equivalent of
// resolveClientSegments. The RPC handler calls it after the graph is valid.
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

// Only the plugins in the config take part (ADR-006). A plugin cannot add itself. Every
// error in a config fails here, before any segment import, so a bad config never boots
// part-way. Those errors are duplicate names, singleton conflicts, missing providers,
// and dependency cycles. The `field` capability is keyed (ADR-009), so many providers
// are correct. The field registry finds a conflict on one field type.
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

  // A singleton capability resolves through the same override rule as a field type and
  // a store slice. That rule does not depend on the order. Two bases at one capability
  // throw, and so do two overrides. An `overrides` declaration is the only way to
  // replace a provider.
  const capabilityEntries = plugins.flatMap((plugin) => {
    const singletonCapabilities = plugin.provides.filter(
      (capability) => capability !== FIELD_CAPABILITY
    );
    return singletonCapabilities.map((capability) => ({
      key: capability,
      value: plugin,
      isOverride: declaresCapabilityOverride(plugin, capability),
    }));
  });
  composeOverridableRegistry(capabilityEntries, capabilityConflictError);

  const provided = new Set(plugins.flatMap((plugin) => plugin.provides));
  for (const plugin of plugins) {
    for (const capability of plugin.dependsOn) {
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

// The init order (ADR-006). A provider runs before the plugins that depend on it. The
// config order decides between plugins that are otherwise equal. A plugin that satisfies
// its own dependency makes no edge. A cycle is an error, and the message names its
// members. The scan for ready plugins is O(n²), which is enough for tens of plugins.
const orderPluginsByDependencies = (
  plugins: PluginManifest[]
): PluginManifest[] => {
  const providersOf = new Map<Capability, PluginManifest[]>();
  for (const plugin of plugins) {
    for (const capability of plugin.provides) {
      providersOf.set(capability, [
        ...(providersOf.get(capability) ?? []),
        plugin,
      ]);
    }
  }

  const ordered: PluginManifest[] = [];
  const emitted = new Set<PluginManifest>();
  const dependenciesSatisfied = (plugin: PluginManifest): boolean => {
    if (emitted.has(plugin)) return false;
    const dependencies = plugin.dependsOn;
    return dependencies.every((capability) => {
      const providers = providersOf.get(capability) ?? [];
      return providers.every(
        (provider) => provider === plugin || emitted.has(provider)
      );
    });
  };
  while (ordered.length < plugins.length) {
    const ready = plugins.filter(dependenciesSatisfied);
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

// The onInit lifecycle (ADR-006). Each hook runs once at each boot, in dependency order,
// and this function waits for it. It returns the teardown. The teardown runs onDestroy in
// the reverse order, and only for the plugins that ran their init. A failure part-way
// through tears those plugins down, and then throws the cause again.
export const initializePlugins = async (
  plugins: PluginManifest[]
): Promise<() => Promise<void>> => {
  const initialized: PluginManifest[] = [];
  // This drains the list, so a second call destroys nothing. Every hook runs, even when
  // one throws. The first failure then throws again.
  const destroyInitialized = async () => {
    const failures: unknown[] = [];
    for (const plugin of initialized.splice(0).reverse()) {
      try {
        await plugin.onDestroy?.();
      } catch (cause) {
        failures.push(cause);
      }
    }
    // Report every teardown failure, and not the first one alone. A later onDestroy
    // must not hide an earlier failure.
    if (failures.length === 1) throw failures[0];
    if (failures.length > 1) {
      throw new AggregateError(failures, 'Plugin teardown failed.');
    }
  };
  for (const plugin of orderPluginsByDependencies(plugins)) {
    try {
      await plugin.onInit?.();
      initialized.push(plugin);
    } catch (cause) {
      // The rollback failure must not replace the failure that caused it, but it must
      // not vanish either: a half-torn-down plugin can leave a handle open, and the
      // thrown `cause` says nothing about that.
      await destroyInitialized().catch((rollbackFailure) => {
        console.error(
          '[tinacms] Plugin teardown failed while rolling back a failed init:',
          rollbackFailure
        );
      });
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
