
import { invariant } from '../invariant';
import {
  REGISTRY_CONFLICTS,
  type RegistryConflict,
  composeOverridableRegistry,
} from '../overridable-registry';
import type { ResolvedSegment } from '../plugin';
import { type AdminScreen, DEFAULT_SCREEN_ORDER } from './contract';

export type ScreenRegistry = Map<string, AdminScreen>;

const screenConflictError = (_conflict: RegistryConflict, key: string): Error =>
  new Error(
    `Two plugins both contribute an admin screen named "${key}", so both would mount ` +
      `at \`#/screens/${key}\`. Rename one of them.`
  );

const validateScreenName = (pluginName: string, screen: AdminScreen): void => {
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
};

export const createScreenRegistry = (
  resolved: ResolvedSegment[]
): ScreenRegistry =>
  composeOverridableRegistry(
    resolved.flatMap(({ manifest, segment }) =>
      (segment.screens ?? []).map((screen) => {
        validateScreenName(manifest.name, screen);
        return { key: screen.name, value: screen, isOverride: false };
      })
    ),
    screenConflictError
  );

export const screenList = (registry: ScreenRegistry): AdminScreen[] =>
  [...registry.values()].sort((left, right) => {
    const byOrder =
      (left.order ?? DEFAULT_SCREEN_ORDER) -
      (right.order ?? DEFAULT_SCREEN_ORDER);
    return byOrder !== 0 ? byOrder : left.name.localeCompare(right.name);
  });
