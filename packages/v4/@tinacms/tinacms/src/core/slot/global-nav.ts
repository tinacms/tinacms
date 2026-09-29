import { invariant } from '../invariant';
import type { PluginManifest, ResolvedSegment } from '../plugin';
import type { ScreenRegistry } from '../screen/registry';
import { DEFAULT_NAV_ORDER, type GlobalNavEntry } from './contract';

const validateEntry = (
  pluginName: string,
  entry: GlobalNavEntry,
  screens: ScreenRegistry
): void => {
  invariant(
    entry.label.length > 0,
    'global-nav-no-label',
    `Plugin "${pluginName}" contributes a global nav entry with an empty label.`
  );
  const { target } = entry;
  if (target.kind === 'screen') {
    invariant(
      screens.has(target.screen),
      'global-nav-unknown-screen',
      `Plugin "${pluginName}" contributes the global nav entry "${entry.label}", ` +
        `but no installed plugin contributes a screen named "${target.screen}".`
    );
  }
};

// TODO(ADR-013 §5): gate entries on `requires: { permission }` once ADR-008 lands.
//turns every plugin's slots.globalNav entries into the one sorted list
export const createGlobalNav = (
  resolved: ResolvedSegment[],
  plugins: PluginManifest[],
  screens: ScreenRegistry
): GlobalNavEntry[] => {
  const provided = new Set(plugins.flatMap((plugin) => plugin.provides));
  return resolved
    .flatMap(({ manifest, segment }) =>
      (segment.slots?.globalNav ?? []).filter((entry) => {
        validateEntry(manifest.name, entry, screens);
        return (entry.dependsOn ?? []).every((capability) =>
          provided.has(capability)
        );
      })
    )
    .sort(
      (left, right) =>
        (left.order ?? DEFAULT_NAV_ORDER) - (right.order ?? DEFAULT_NAV_ORDER)
    );
};
