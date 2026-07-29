// A screen a plugin adds to the admin, beside the collection views the schema generates.
//
// The admin shell renders exactly one thing: the content model. A media library, a
// branch view, a settings screen, and a search result are none of them a collection, and
// nothing in the shell should have to name them. A plugin contributes one of these and
// the shell routes to it, lists it in the navigation, and otherwise knows nothing about
// it.
//
// A screen is not a UI slot (ADR-013). A slot is fan-in: many plugins stack chrome into
// one named region, and the hard question is ordering. A screen is the inverse — one
// component owns one route, and two plugins claiming one name is a collision to report.
// That is the cardinality of a keyed capability, which is why the screen registry
// composes through composeOverridableRegistry and a slot registry will not.

import type { ComponentType } from 'react';

export interface AdminScreenProps {
  // The route segments after the screen name. `#/screens/media/photos/2026` gives
  // `['photos', '2026']`. A screen with one view ignores this; a screen that navigates
  // within itself reads it, and calls `navigate` from useAdminRoute to write it. The
  // segments are decoded, so a segment may hold a slash.
  segments: string[];
}

export interface AdminScreen {
  // The route key, and the segment this screen mounts at under `#/screens/`. It must be
  // a single segment: no slashes, because the segments after it belong to the screen.
  name: string;
  // The navigation entry.
  label: string;
  // Where this sits in the navigation, low to high. Explicit, because the order two
  // plugins appear in must not depend on the order they were installed (ADR-006, and
  // ADR-013 §6 for the same rule applied to slots). Screens that share an order — which
  // is every screen that declares none — sort by name, so the arrangement is the same
  // whichever way the plugin list is written.
  order?: number;
  component: ComponentType<AdminScreenProps>;
}

// The order of a screen that declares none. Zero and not Infinity, so a plugin can sit a
// screen above the default set with a negative number as well as below it.
export const DEFAULT_SCREEN_ORDER = 0;
