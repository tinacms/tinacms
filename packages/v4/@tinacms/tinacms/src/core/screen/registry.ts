import { invariant } from '../invariant';
import {
  REGISTRY_CONFLICTS,
  type RegistryConflict,
  composeOverridableRegistry,
} from '../overridable-registry';
import {
  type PluginManifest,
  type ResolvedSegment,
  SCREEN_CAPABILITY,
} from '../plugin';
import { type AdminScreen, DEFAULT_SCREEN_ORDER } from './contract';

export type ScreenRegistry = Map<string, AdminScreen>;

const overridesScreenKey = (manifest: PluginManifest, key: string): boolean =>
  manifest.overrides.some(
    (override) =>
      override.capability === SCREEN_CAPABILITY && override.key === key
  );

const screenConflictError = (
  conflict: RegistryConflict,
  key: string
): Error => {
  if (conflict === REGISTRY_CONFLICTS.duplicateOverride) {
    return new Error(
      `Two plugins both declare an \`overrides\` for the admin screen "${key}". ` +
        'Only one may replace or remove it.'
    );
  }
  return new Error(
    `Two plugins both contribute an admin screen named "${key}", so both would mount ` +
      `at \`#/screens/${key}\`. Rename one of them, or declare ` +
      '`overrides: [{ capability: "screen", key }]` on the replacement.'
  );
};

const validateScreen = (pluginName: string, screen: AdminScreen): void => {
  invariant(
    screen.name.length > 0,
    'admin-screen-no-name',
    `Plugin "${pluginName}" contributes an admin screen with an empty name.`
  );
  invariant(
    !screen.name.includes('/'),
    'admin-screen-name-has-slash',
    `Plugin "${pluginName}" contributes the admin screen "${screen.name}", but a ` +
      'screen name is one route segment and cannot hold a slash.'
  );
  invariant(
    screen.component,
    'admin-screen-no-component',
    `Plugin "${pluginName}" contributes the admin screen "${screen.name}" with no component.`
  );
};

// A screen override from a plugin that contributes no screen of that name
// removes the screen.
export const screensRemovedByOverride = (
  resolved: ResolvedSegment[],
  plugins: PluginManifest[]
): string[] => {
  //maps plugin names to the set of screen names they contribute
  const screenNamesByPlugin = new Map(
    resolved.map(({ manifest, segment }) => [
      manifest.name,
      new Set((segment.screens ?? []).map((screen) => screen.name)),
    ])
  );
  const existingScreenNames = new Set(
    [...screenNamesByPlugin.values()].flatMap((names) => [...names])
  );

  return plugins.flatMap((plugin) => {
    const pluginScreenNames = screenNamesByPlugin.get(plugin.name);

    return plugin.overrides.flatMap((override) => {
      if (override.capability !== SCREEN_CAPABILITY) return [];
      const replacesScreen = pluginScreenNames?.has(override.key);
      const screenExists = existingScreenNames.has(override.key);
      return replacesScreen || !screenExists ? [] : [override.key];
    });
  });
};

//gather all plugins screens into one Map keyed by screen name
export const createScreenRegistry = (
  resolved: ResolvedSegment[],
  plugins: PluginManifest[]
): ScreenRegistry => {
  const contributedScreens = resolved.flatMap(({ manifest, segment }) =>
    (segment.screens ?? []).map((screen) => {
      validateScreen(manifest.name, screen);
      return {
        key: screen.name,
        value: screen,
        isOverride: overridesScreenKey(manifest, screen.name),
      };
    })
  );

  const removedScreens = screensRemovedByOverride(resolved, plugins).map(
    (key) => ({ key, value: null, isOverride: true })
  );

  const screensAfterOverrides = composeOverridableRegistry<AdminScreen | null>(
    [...contributedScreens, ...removedScreens],
    screenConflictError
  );

  const registry: ScreenRegistry = new Map();
  for (const [key, screen] of screensAfterOverrides) {
    if (screen) registry.set(key, screen);
  }
  return registry;
};

export const screenList = (registry: ScreenRegistry): AdminScreen[] =>
  [...registry.values()].sort((left, right) => {
    const byOrder =
      (left.order ?? DEFAULT_SCREEN_ORDER) -
      (right.order ?? DEFAULT_SCREEN_ORDER);
    return byOrder !== 0 ? byOrder : left.name.localeCompare(right.name);
  });
