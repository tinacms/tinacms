import React from 'react';
import { type ReactNode, createContext, useContext, useMemo } from 'react';

import type { Form } from '@toolkit/forms';
import type { MdxTemplate } from '../types';
import {
  ALL_HEADING_LEVELS,
  normalizeHeadingLevels,
  type HeadingLevel,
} from '@tinacms/schema-tools';
import type {
  ToolbarOverrides,
  ToolbarOverrideType,
} from './toolbar-overrides';

interface ToolbarContextProps {
  tinaForm: Form;
  templates: MdxTemplate[];
  overrides: ToolbarOverrideType[] | ToolbarOverrides;
  headingLevels: readonly HeadingLevel[];
  /**
   * True when the schema explicitly sets `overrides.headingLevels`
   * (including an explicit empty array, which means "no headings").
   * Lets consumers (e.g. the slash menu) distinguish "user opted in"
   * from "use the legacy default" without re-deriving the check.
   */
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
  tinaForm,
  templates,
  overrides,
  children,
}) => {
  const configured = !Array.isArray(overrides)
    ? overrides?.headingLevels
    : undefined;
  const headingLevelsConfigured = Array.isArray(configured);

  const headingLevels = useMemo<readonly HeadingLevel[]>(
    () =>
      configured ? normalizeHeadingLevels(configured) : ALL_HEADING_LEVELS,
    [configured]
  );

  return (
    <ToolbarContext.Provider
      value={{
        tinaForm,
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
