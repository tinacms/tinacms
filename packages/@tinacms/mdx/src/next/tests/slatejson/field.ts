import { RichTextField } from '@tinacms/schema-tools';

export const field: RichTextField = {
  name: 'unstructured',
  label: 'Unstructured Content',
  type: 'rich-text',
  parser: { type: 'slatejson' },
};
