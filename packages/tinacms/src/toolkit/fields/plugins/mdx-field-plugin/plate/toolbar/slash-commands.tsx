'use client';

import * as React from 'react';
import type { ComponentType, SVGProps } from 'react';
import type { PlateEditor } from '@udecode/plate/react';

export interface SlashCommandRule {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  value: string;
  keywords?: string[];
  onSelect: (editor: PlateEditor) => void;
}

const SlashCommandsContext = React.createContext<SlashCommandRule[] | undefined>(
  undefined
);

export const SlashCommandsProvider: React.FC<{
  rules: SlashCommandRule[];
  children: React.ReactNode;
}> = ({ rules, children }) => {
  return (
    <SlashCommandsContext.Provider value={rules}>
      {children}
    </SlashCommandsContext.Provider>
  );
};

export const useSlashCommands = (): SlashCommandRule[] => {
  return React.useContext(SlashCommandsContext) ?? [];
};
