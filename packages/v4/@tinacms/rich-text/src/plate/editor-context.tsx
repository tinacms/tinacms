import React from 'react';
import type { MdxTemplate } from './types';

export interface EditorContextValue {
  fieldName: string;
  templates: MdxTemplate[];
  rawMode: boolean;
  setRawMode: (mode: boolean) => void;
  onActivateField: (address: string) => void;
}

export const EditorContext = React.createContext<EditorContextValue>({
  fieldName: '',
  rawMode: false,
  setRawMode: () => {},
  templates: [],
  onActivateField: () => {},
});

export const useEditorContext = () => {
  return React.useContext(EditorContext);
};

export const useTemplates = () => {
  return React.useContext(EditorContext);
};
