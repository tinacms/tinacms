import React from 'react';
import { type ReactNode, createContext, useContext } from 'react';

import type { Form } from '@toolkit/forms';
import type { MdxTemplate } from '../types';
import type {
  ToolbarOverrides,
  ToolbarOverrideType,
} from './toolbar-overrides';

import {
  SlashCommandsProvider,
  type SlashCommandRule,
} from './slash-commands';

interface ToolbarContextProps {
  tinaForm: Form;
  templates: MdxTemplate[];
  overrides: ToolbarOverrideType[] | ToolbarOverrides;
}

interface ToolbarProviderProps extends ToolbarContextProps {
  children: ReactNode;
}

const ToolbarContext = createContext<ToolbarContextProps | undefined>(
  undefined
);

function templatesToSlashRules(templates: MdxTemplate[]): SlashCommandRule[] {
  if (!Array.isArray(templates)) return [];

  return templates
    .filter((t: any) => t && (t.name || t.label))
    .map((t: any) => {
      const label = (t.label ?? t.name) as string;
      const name = (t.name ?? t.label) as string;

      const keywords = [
        String(name).toLowerCase(),
        String(label).toLowerCase(),
        ...(Array.isArray(t.fields)
          ? t.fields
              .map((f: any) => f?.name || f?.label)
              .filter(Boolean)
              .map((s: any) => String(s).toLowerCase())
          : []),
      ];

      return {
        icon: undefined,
        value: label,
        keywords,
        onSelect: (editor) => {
          // eslint-disable-next-line no-console
          console.warn('Slash command selected:', { template: t, editor });
        },
      } satisfies SlashCommandRule;
    });
}

export const ToolbarProvider: React.FC<ToolbarProviderProps> = ({
  tinaForm,
  templates,
  overrides,
  children,
}) => {
  const slashRules = React.useMemo(() => {
    return templatesToSlashRules(templates);
  }, [templates]);

  return (
    <ToolbarContext.Provider value={{ tinaForm, templates, overrides }}>
      <SlashCommandsProvider rules={slashRules}>{children}</SlashCommandsProvider>
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
