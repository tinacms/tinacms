import { fieldConflictError, overridesFieldKey } from './field/registry';
import { invariant } from './invariant';
import { declaresCapabilityOverride } from './mount';
import {
  REGISTRY_CONFLICTS,
  type RegistryConflict,
  composeOverridableRegistry,
} from './overridable-registry';
import {
  type Capability,
  type PluginManifest,
  type ResolvedServerSegment,
  isSingletonSliceCapability,
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

  for (const plugin of plugins) {
    for (const override of plugin.overrides) {
      invariant(
        plugin.provides.includes(override.capability),
        'override-without-provides',
        `Plugin "${plugin.name}" declares \`overrides\` for "${override.capability}" ` +
          `but does not declare \`provides: ["${override.capability}"]\`, so it ` +
          'would never replace the built-in.'
      );
    }
  }

  composeOverridableRegistry(
    plugins.flatMap((plugin) =>
      plugin.field
        ? [
            {
              key: plugin.field.type,
              value: plugin,
              isOverride: overridesFieldKey(plugin, plugin.field.type),
            },
          ]
        : []
    ),
    fieldConflictError
  );

  const capabilityEntries = plugins.flatMap((plugin) => {
    const singletonCapabilities = plugin.provides.filter(
      isSingletonSliceCapability
    );
    invariant(
      singletonCapabilities.length <= 1,
      'plugin-multiple-singleton-slices',
      `Plugin "${plugin.name}" provides ${singletonCapabilities.length} ` +
        `singleton capabilities (${singletonCapabilities.join(', ')}), but a ` +
        'plugin mounts at only one namespace. Split it into one plugin per capability.'
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

export const initializePlugins = async (
  plugins: PluginManifest[]
): Promise<() => Promise<void>> => {
  const initialized: PluginManifest[] = [];
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
