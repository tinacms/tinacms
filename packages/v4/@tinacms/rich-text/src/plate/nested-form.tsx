import type { TemplateField } from './types';

// ponytail: stub — editing an embed's props needs a nested form panel, and that
// panel is the object field (plugins/fields/object/, not built yet). Embeds
// still parse, render, and serialize; only their side panel is missing, so
// opening a document here loses nothing from it.
//
// When the object field lands, this renders it against `fields`/`initialValues`
// and reports edits through `onChange` — every call site already passes all three.
export const NestedForm = (_props: {
  onClose: () => void;
  id: string;
  label: string;
  fields: TemplateField[];
  initialValues: object;
  onChange: (values: object) => void;
}) => null;
