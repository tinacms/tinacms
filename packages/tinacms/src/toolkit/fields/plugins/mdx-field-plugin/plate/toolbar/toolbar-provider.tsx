import React from 'react';
import { type ReactNode, createContext, useContext, useMemo } from 'react';

import { isSafeCssColor } from '@tinacms/mdx/sanitize-css-color';
import {
  ALL_HEADING_LEVELS,
  DEFAULT_HIGHLIGHT_COLORS,
  DEFAULT_TEXT_COLORS,
  type HeadingLevel,
  normalizeHeadingLevels,
} from '@tinacms/schema-tools';
import type { Form } from '@toolkit/forms';
import type { MdxTemplate } from '../types';
import type {
  RichTextColorOption,
  ToolbarOverrideType,
  ToolbarOverrides,
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
  tinaForm,
  templates,
  overrides,
  children,
}) => {
  const objectOverrides = !Array.isArray(overrides) ? overrides : undefined;
  const configured = objectOverrides?.headingLevels;
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
        textColors: resolvePalette(
          'textColors',
          objectOverrides?.textColors,
          DEFAULT_TEXT_COLORS
        ),
        highlightColors: resolvePalette(
          'highlightColors',
          objectOverrides?.highlightColors,
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
