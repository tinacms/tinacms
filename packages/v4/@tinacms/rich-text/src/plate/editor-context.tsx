import React from 'react';
import type { MdxTemplate } from './types';

// What the host tells the editor about the field being edited. The host renders
// the provider; this package never reaches back into it, which is what keeps the
// dependency one-way and lets `@tinacms/tinacms` depend on this package rather
// than the two importing each other.
export interface EditorContextValue {
  fieldName: string;
  templates: MdxTemplate[];
  rawMode: boolean;
  setRawMode: (mode: boolean) => void;
  // Called when the author selects an embed, with the address of that embed's
  // props. What activation *means* is the host's business — v4 puts it in the
  // form store's single active field. The no-op default keeps the editor usable
  // without a host (a test, a story).
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
