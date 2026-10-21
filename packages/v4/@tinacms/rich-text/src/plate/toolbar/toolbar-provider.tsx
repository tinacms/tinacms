import React from 'react';
import { type ReactNode, createContext, useContext, useMemo } from 'react';

import {
  ALL_HEADING_LEVELS,
  DEFAULT_TEXT_COLORS,
  type HeadingLevel,
  normalizeHeadingLevels,
} from '@tinacms/schema-tools';
import { isSafeCssColor } from '../plugins/ui/components';
import type { MdxTemplate } from '../types';
import type {
  RichTextColorOption,
  ToolbarOverrides,
} from './toolbar-overrides';

interface ToolbarContextProps {
  templates: MdxTemplate[];
  overrides: ToolbarOverrides | undefined;
  headingLevels: readonly HeadingLevel[];
  headingLevelsConfigured: boolean;
  /** Palette for the text colour dropdown (schema value or default). */
  textColors: readonly RichTextColorOption[];
}

interface ToolbarProviderProps
  extends Omit<
    ToolbarContextProps,
    'headingLevels' | 'headingLevelsConfigured' | 'textColors'
  > {
  children: ReactNode;
}

const ToolbarContext = createContext<ToolbarContextProps | undefined>(
  undefined
);

/**
 * Returns the configured palette (or the default), minus colours the
 * serialiser would drop on save — warning so misconfiguration isn't silent.
 */
const resolvePalette = (
  configured: readonly RichTextColorOption[] | undefined,
  fallback: readonly RichTextColorOption[]
): readonly RichTextColorOption[] => {
  if (!configured) return fallback;
  return configured.filter(({ value }) => {
    if (isSafeCssColor(value)) return true;
    console.warn(
      `[tinacms] Ignoring unsupported colour "${value}" in rich-text overrides.textColors. Use hex, a named colour, a colour function such as rgb()/lab()/color-mix(), or var(--name).`
    );
    return false;
  });
};

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

  const textColors = useMemo(
    () => resolvePalette(overrides?.textColors, DEFAULT_TEXT_COLORS),
    [overrides?.textColors]
  );

  return (
    <ToolbarContext.Provider
      value={{
        templates,
        overrides,
        headingLevels,
        headingLevelsConfigured,
        textColors,
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
