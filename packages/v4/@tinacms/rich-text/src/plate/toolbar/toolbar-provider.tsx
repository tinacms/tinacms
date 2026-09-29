import React from 'react';
import { type ReactNode, createContext, useContext } from 'react';

import {
  ALL_HEADING_LEVELS,
  DEFAULT_HIGHLIGHT_COLORS,
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
  /** Palette for the highlight dropdown (schema value or default). */
  highlightColors: readonly RichTextColorOption[];
}

interface ToolbarProviderProps
  extends Omit<
    ToolbarContextProps,
    | 'headingLevels'
    | 'headingLevelsConfigured'
    | 'textColors'
    | 'highlightColors'
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
  name: 'textColors' | 'highlightColors',
  configured: readonly RichTextColorOption[] | undefined,
  fallback: readonly RichTextColorOption[]
): readonly RichTextColorOption[] => {
  if (!configured) return fallback;
  return configured.filter(({ value }) => {
    if (isSafeCssColor(value)) return true;
    console.warn(
      `[tinacms] Ignoring unsupported colour "${value}" in rich-text overrides.${name}. Use hex, a named colour, rgb()/hsl()/oklch()/oklab() or var(--name).`
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

  return (
    <ToolbarContext.Provider
      value={{
        templates,
        overrides,
        headingLevels,
        headingLevelsConfigured,
        textColors: resolvePalette(
          'textColors',
          overrides?.textColors,
          DEFAULT_TEXT_COLORS
        ),
        highlightColors: resolvePalette(
          'highlightColors',
          overrides?.highlightColors,
          DEFAULT_HIGHLIGHT_COLORS
        ),
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
