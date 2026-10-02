import type { TemplateField } from './types';

// ponytail: stub — editing an embed's props needs a nested form panel, and that
export const NestedForm = (_props: {
  onClose: () => void;
  id: string;
  label: string;
  fields: TemplateField[];
  initialValues: object;
  onChange: (values: object) => void;
}) => null;
