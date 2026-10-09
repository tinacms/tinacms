// Two rows of five: what the value is, then what the editor is doing to it.
// Every case puts each state in the same cell, so a column reads down the page.
export const STATES = [
  { name: 'empty', label: 'Empty' },
  { name: 'filled', label: 'Filled' },
  { name: 'overflow', label: 'Overflow' },
  { name: 'required', label: 'Required' },
  { name: 'dirty', label: 'Dirty' },
  { name: 'hover', label: 'Hover' },
  { name: 'focused', label: 'Focused' },
  { name: 'invalid', label: 'Invalid' },
  { name: 'disabled', label: 'Disabled' },
  { name: 'readOnly', label: 'Read-only' },
] as const;

export type StateName = (typeof STATES)[number]['name'];

export interface FrameFlags {
  focused?: boolean;
  hover?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  dirty?: boolean;
  errors?: string[];
  warnings?: string[];
  touched?: boolean;
}
