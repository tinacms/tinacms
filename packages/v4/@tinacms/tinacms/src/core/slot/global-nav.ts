import { invariant } from '../invariant';
import type { PluginManifest, ResolvedSegment } from '../plugin';
import {
  type ScreenRegistry,
  screensRemovedByOverride,
} from '../screen/registry';
import {
  DEFAULT_NAV_ORDER,
  type GlobalNavEntry,
  type GlobalNavSection,
} from './contract';

type DeclaredGroups = ReadonlyMap<string, GlobalNavSection>;

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

const validateGroup = (
  pluginName: string,
  { label, group }: GlobalNavEntry,
  groups: DeclaredGroups
): void => {
  if (group === undefined) return;
  invariant(
    groups.has(group),
    'global-nav-unknown-group',
    `Plugin "${pluginName}" puts the global nav entry "${label}" in the group "${group}", ` +
      'but no installed plugin declares that group.'
  );
};

const declareGroups = (
  resolved: ResolvedSegment[]
): Map<string, GlobalNavSection> => {
  const groups = new Map<string, GlobalNavSection>();
  for (const { manifest, segment } of resolved) {
    for (const group of segment.slots?.navGroups ?? []) {
      invariant(
        !groups.has(group.id),
        'global-nav-duplicate-group',
        `Plugin "${manifest.name}" declares the nav group "${group.id}", ` +
          'but another plugin already declares it.'
      );
      groups.set(group.id, { group, entries: [] });
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

// Gives a segment's groups, then one section for each of its ungrouped
// entries, in plugin order. Grouped entries go into their group's section.
const collectSegment = (
  { manifest, segment }: ResolvedSegment,
  screens: ScreenRegistry,
  groups: DeclaredGroups,
  isShown: (entry: GlobalNavEntry) => boolean
): GlobalNavSection[] => {
  const sections = (segment.slots?.navGroups ?? []).flatMap(
    ({ id }) => groups.get(id) ?? []
  );
  for (const entry of segment.slots?.globalNav ?? []) {
    validateGroup(manifest.name, entry, groups);
    if (!isShown(entry)) continue;
    validateEntry(manifest.name, entry, screens);
    if (entry.group === undefined) {
      sections.push({ entries: [entry] });
    } else {
      groups.get(entry.group)?.entries.push(entry);
    }
  }
  return sections;
};

const mergeUngroupedRuns = (
  sections: GlobalNavSection[]
): GlobalNavSection[] => {
  const merged: GlobalNavSection[] = [];
  for (const section of sections) {
    const last = merged.at(-1);
    if (section.group === undefined && last && last.group === undefined) {
      last.entries.push(...section.entries);
    } else {
      merged.push(section);
    }
  }
  return merged;
};

// TODO(ADR-013 §5): gate entries on `requires: { permission }` once ADR-008 lands.
// See ADR-027 for groups and their order.
export const createGlobalNav = (
  resolved: ResolvedSegment[],
  plugins: PluginManifest[],
  screens: ScreenRegistry
): GlobalNavSection[] => {
  const provided = new Set(plugins.flatMap((plugin) => plugin.provides));
  const removed = new Set(screensRemovedByOverride(resolved, plugins));
  const isShown = ({ target, dependsOn = [] }: GlobalNavEntry) =>
    !(target.kind === 'screen' && removed.has(target.screen)) &&
    dependsOn.every((capability) => provided.has(capability));

  const groups = declareGroups(resolved);
  const sections = resolved.flatMap((segment) =>
    collectSegment(segment, screens, groups, isShown)
  );
  for (const { entries } of groups.values()) {
    sortByOrder(entries, (entry) => entry.order);
  }
  return mergeUngroupedRuns(
    sortByOrder(
      sections.filter(({ entries }) => entries.length > 0),
      ({ group, entries }) => (group ? group.order : entries[0]?.order)
    )
  );
};
