// The admin screens, composed at boot from the client segments of the plugins.
//
// This is a registry and not a store slice, for the reason the field registry is one
// (refer to TinaRuntime in editor/context.ts): it is a fixed map of React components,
// which is config and not state. It is decided at boot from the plugin list, nothing
// mutates it afterwards, and the devtools could not serialize a component. What *is*
// state — which screen is open — lives in the route, where a reload and a shared link
// both keep it.

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

// The name is a route segment, so the router has to be able to give it back. A name
// holding a slash would parse as a screen name plus a segment, and the screen would
// never match its own route. Caught at boot, where the author can act on it, and not as
// a navigation entry that leads to a blank view.
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
        // No screen takes an override. `overrides` replaces a *capability* provider,
        // and a screen is not one — two plugins wanting the same screen name is a
        // collision to report, not one to resolve silently in favour of whoever
        // declared it.
        return { key: screen.name, value: screen, isOverride: false };
      })
    ),
    screenConflictError
  );

// The screens in navigation order: by `order`, then by name.
//
// Never in registration order. That is the order the plugins happen to be listed in, so
// moving one line in a config array would reshuffle the navigation — the "load order
// never silently decides" rule of ADR-006. Sorting the ties by name instead makes the
// arrangement a property of the screens themselves.
export const screenList = (registry: ScreenRegistry): AdminScreen[] =>
  [...registry.values()].sort((left, right) => {
    const byOrder =
      (left.order ?? DEFAULT_SCREEN_ORDER) -
      (right.order ?? DEFAULT_SCREEN_ORDER);
    return byOrder !== 0 ? byOrder : left.name.localeCompare(right.name);
  });
