import type { Collection } from 'tinacms';
import { makeSlugify, tagsFieldSchema } from '../schemas/shared-fields';

const Documentation: Collection = {
  label: 'Documentation',
  name: 'documentation',
  path: 'content/documentation',
  format: 'mdx',
  ui: {
    router: ({ document }) =>
      `/documentation/${document._sys.breadcrumbs.join('/')}`,
    filename: {
      slugify: makeSlugify('doc'),
    },
  },
  fields: [
    {
      type: 'string',
      label: 'Title',
      name: 'title',
      isTitle: true,
      required: true,
    },
    tagsFieldSchema,
    {
      type: 'rich-text',
      label: 'Body',
      name: '_body',
      isBody: true,
    },
  ],
};

export default Documentation;
