import React from 'react';
import { type ReactNode, createContext, useContext } from 'react';

import {
  ALL_HEADING_LEVELS,
  type HeadingLevel,
  normalizeHeadingLevels,
} from '@tinacms/schema-tools';
import type { MdxTemplate } from '../types';
import type { ToolbarOverrides } from './toolbar-overrides';

interface ToolbarContextProps {
  templates: MdxTemplate[];
  overrides: ToolbarOverrides | undefined;
  headingLevels: readonly HeadingLevel[];
  headingLevelsConfigured: boolean;
}

interface ToolbarProviderProps
  extends Omit<
    ToolbarContextProps,
    'headingLevels' | 'headingLevelsConfigured'
  > {
  children: ReactNode;
}

const ToolbarContext = createContext<ToolbarContextProps | undefined>(
  undefined
);

export const ToolbarProvider: React.FC<ToolbarProviderProps> = ({
  templates,
  overrides,
  children,
}) => {
  const configured = overrides?.headingLevels;
  const headingLevelsConfigured = Array.isArray(configured);

  const headingLevels: readonly HeadingLevel[] = configured
    ? normalizeHeadingLevels(configured)
    : ALL_HEADING_LEVELS;

  return (
    <ToolbarContext.Provider
      value={{
        templates,
        overrides,
        headingLevels,
        headingLevelsConfigured,
      }}
    >
      {children}
    </ToolbarContext.Provider>
  );
};

export const useToolbarContext = (): ToolbarContextProps => {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error('useToolbarContext must be used within a ToolbarProvider');
  }
  return context;
};
