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

export type GlobalNavItem =
  | { kind: 'entry'; entry: GlobalNavEntry }
  | { kind: 'group'; group: NavGroup; entries: GlobalNavEntry[] };

// Definitions for global navigation slot options
export interface SlotContributions {
  globalNav?: GlobalNavEntry[];
  navGroups?: NavGroup[];
}

export const DEFAULT_NAV_ORDER = 0;
