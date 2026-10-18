import { invariant } from '../invariant';
import type { PluginManifest, ResolvedSegment } from '../plugin';
import {
  type ScreenRegistry,
  screensRemovedByOverride,
} from '../screen/registry';
import {
  DEFAULT_NAV_ORDER,
  type GlobalNavEntry,
  type GlobalNavItem,
} from './contract';

const validateEntry = (
  pluginName: string,
  entry: GlobalNavEntry,
  screens: ScreenRegistry,
  groups: Map<string, GroupItem>
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
  if (entry.group !== undefined) {
    invariant(
      groups.has(entry.group),
      'global-nav-unknown-group',
      `Plugin "${pluginName}" puts the global nav entry "${entry.label}" in the group "${entry.group}", ` +
        'but no installed plugin declares that group.'
    );
  }
};

type GroupItem = Extract<GlobalNavItem, { kind: 'group' }>;

const declareGroups = (resolved: ResolvedSegment[]): Map<string, GroupItem> => {
  const groups = new Map<string, GroupItem>();
  for (const { manifest, segment } of resolved) {
    for (const group of segment.slots?.navGroups ?? []) {
      invariant(
        !groups.has(group.id),
        'global-nav-duplicate-group',
        `Plugin "${manifest.name}" declares the nav group "${group.id}", ` +
          'but another plugin already declares it.'
      );
      groups.set(group.id, { kind: 'group', group, entries: [] });
    }
  }
  return groups;
};

const sortByOrder = <T>(
  items: T[],
  orderOf: (item: T) => number | undefined
): T[] =>
  items.sort(
    (left, right) =>
      (orderOf(left) ?? DEFAULT_NAV_ORDER) -
      (orderOf(right) ?? DEFAULT_NAV_ORDER)
  );

// TODO(ADR-013 §5): gate entries on `requires: { permission }` once ADR-008 lands.
// Turns every plugin's navGroups and globalNav into one sorted list (ADR-027).
export const createGlobalNav = (
  resolved: ResolvedSegment[],
  plugins: PluginManifest[],
  screens: ScreenRegistry
): GlobalNavItem[] => {
  const provided = new Set(plugins.flatMap((plugin) => plugin.provides));
  const removed = new Set(screensRemovedByOverride(resolved, plugins));
  const isShown = ({ target, dependsOn = [] }: GlobalNavEntry) =>
    !(target.kind === 'screen' && removed.has(target.screen)) &&
    dependsOn.every((capability) => provided.has(capability));

  const groups = declareGroups(resolved);
  const items: GlobalNavItem[] = [];
  for (const { manifest, segment } of resolved) {
    for (const { id } of segment.slots?.navGroups ?? []) {
      const group = groups.get(id);
      if (group) items.push(group);
    }
    for (const entry of segment.slots?.globalNav ?? []) {
      if (!isShown(entry)) continue;
      validateEntry(manifest.name, entry, screens, groups);
      if (entry.group === undefined) {
        items.push({ kind: 'entry', entry });
      } else {
        groups.get(entry.group)?.entries.push(entry);
      }
    }
  }

  for (const group of groups.values()) {
    sortByOrder(group.entries, (entry) => entry.order);
  }
  return sortByOrder(
    items.filter((item) => item.kind === 'entry' || item.entries.length > 0),
    (item) => (item.kind === 'group' ? item.group.order : item.entry.order)
  );
};
