import React from 'react';
import type { MdxTemplate } from './types';

export interface EditorContextValue {
  fieldName: string;
  templates: MdxTemplate[];
  rawMode: boolean;
  setRawMode: (mode: boolean) => void;
  onActivateField: (address: string) => void;
  /** How many fields under `address` show an error. An embed draws it as a red count. */
  errorCount?: (address: string) => number;
  /**
   * The object field that would show embed props (ADR pending) does not
   * exist yet, so the Edit control has nothing to open. Optional so an
   * existing `Provider` value stays valid without this field; consumers
   * treat a missing value as unavailable. Flip it once that field lands.
   */
  embedEditAvailable?: boolean;
}

export const EditorContext = React.createContext<EditorContextValue>({
  fieldName: '',
  rawMode: false,
  setRawMode: () => {},
  templates: [],
  onActivateField: () => {},
  errorCount: () => 0,
  embedEditAvailable: false,
});

export const useEditorContext = () => {
  return React.useContext(EditorContext);
};

export const useTemplates = () => {
  return React.useContext(EditorContext);
};
