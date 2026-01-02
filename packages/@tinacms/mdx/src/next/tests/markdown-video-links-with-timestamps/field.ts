import type { RichTextField } from '@tinacms/schema-tools';

export const field: RichTextField = {
  type: 'rich-text',
  name: 'body',
  parser: {
    type: 'markdown',
  },
};
