import type { ComponentType } from 'react';

export interface AdminScreenProps {
  segments: string[];
}

export interface AdminScreen {
  name: string;
  label: string;
  order?: number;
  component: ComponentType<AdminScreenProps>;
}

export const DEFAULT_SCREEN_ORDER = 0;
