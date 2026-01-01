'use client';

import React, {
  createContext,
  useContext,
  type ReactNode,
  type ComponentType,
  type SVGProps,
} from 'react';
import type { Form } from '@toolkit/forms';
import type { MdxTemplate } from '../types';
import type { ToolbarOverrides, ToolbarOverrideType } from './toolbar-overrides';
import type { PlateEditor } from '@udecode/plate/react';

export interface SlashCommandRule {
  value: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  onSelect: (editor: PlateEditor) => void;
}

interface ToolbarContextProps {
  tinaForm: Form;
  templates: MdxTemplate[];
  overrides: ToolbarOverrideType[] | ToolbarOverrides;

  slashRules?: SlashCommandRule[];
}

interface ToolbarProviderProps extends ToolbarContextProps {
  children: ReactNode;
}

const ToolbarContext = createContext<ToolbarContextProps | undefined>(undefined);

export const ToolbarProvider: React.FC<ToolbarProviderProps> = ({
  tinaForm,
  templates,
  overrides,
  slashRules,
  children,
}) => {
  return (
    <ToolbarContext.Provider
      value={{ tinaForm, templates, overrides, slashRules }}
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
