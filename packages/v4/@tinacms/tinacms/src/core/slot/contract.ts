import type { ComponentType } from 'react';
import type { Capability } from '../plugin';

export type ScreenTarget = { kind: 'screen'; screen: string };
export type UrlTarget = { kind: 'url'; href: string };
export type ActionTarget = { kind: 'action'; run: () => void };

export type NavTarget = ScreenTarget | UrlTarget | ActionTarget;

export interface GlobalNavEntry {
  label: string;
  icon: ComponentType<{ className?: string }>;
  target: NavTarget;
  order?: number;
  // The id of a declared `NavGroup`. Inside a group, `order` ranks the entry within that group (ADR-027 §2).
  group?: string;
  // The entry renders only when an installed plugin provides each of these.
  dependsOn?: Capability[];
}
export interface NavGroup {
  id: string;
  label: string;
  order?: number;
}

// A run of entries without a group, or one group with its entries.
export interface GlobalNavSection {
  group?: NavGroup;
  entries: GlobalNavEntry[];
}

export type HomeTier = 'desktop' | 'tablet' | 'phone';

/** What Home passes to each panel: the width tier of the window. */
export interface HomePanelContext {
  tier: HomeTier;
}

export type HomePanelColumn = 'main' | 'side';

/** One panel on Home. A panel loads its own data and draws its own states. */
export interface HomePanelContribution {
  /** Unique across plugins. A duplicate throws at boot. */
  id: string;
  component: ComponentType<HomePanelContext>;
  /** The column on a desktop. */
  column: HomePanelColumn;
  /** The position in its column on a desktop. Lower is first. 0 by default. */
  order?: number;
  /** The position in the one-column layout of a tablet and a phone. `order` by default. */
  narrowOrder?: number;
  // The panel mounts only when an installed plugin provides each of these.
  dependsOn?: Capability[];
}

/** The panels of Home, sorted for each layout. */
export interface HomePanels {
  main: HomePanelContribution[];
  side: HomePanelContribution[];
  narrow: HomePanelContribution[];
}

export interface SlotContributions {
  globalNav?: GlobalNavEntry[];
  navGroups?: NavGroup[];
  'home.panel'?: HomePanelContribution[];
}

export const DEFAULT_NAV_ORDER = 0;

export const DEFAULT_HOME_PANEL_ORDER = 0;
