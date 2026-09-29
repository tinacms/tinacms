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
  // The entry renders only when an installed plugin provides each of these. 
  dependsOn?: Capability[];
}
// Definitions for global navigation slot options 
export interface SlotContributions {
  globalNav?: GlobalNavEntry[];
}

export const DEFAULT_NAV_ORDER = 0;
