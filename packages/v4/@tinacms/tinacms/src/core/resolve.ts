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

// Every config error fails here, before any segment import, so a bad config
// never boots part-way (ADR-006). `field` is keyed, so many providers are
// correct; the field registry finds per-type conflicts.
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

  // Singleton capabilities resolve through the same order-independent override
  // rule as field types and store slices.
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

// Init order (ADR-006): providers before dependents, config order breaks ties,
// a cycle is an error. The ready scan is O(n²), enough for tens of plugins.
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

// Runs each onInit once per boot in dependency order and returns the teardown,
// which runs onDestroy in reverse for the plugins that ran their init (ADR-006).
export const initializePlugins = async (
  plugins: PluginManifest[]
): Promise<() => Promise<void>> => {
  const initialized: PluginManifest[] = [];
  // Drains the list, so a second call destroys nothing.
  const destroyInitialized = async () => {
    const failures: unknown[] = [];
    for (const plugin of initialized.splice(0).reverse()) {
      try {
        await plugin.onDestroy?.();
      } catch (cause) {
        failures.push(cause);
      }
    }
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
      // The rollback failure must not replace the failure that caused it, but
      // must not vanish either.
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
