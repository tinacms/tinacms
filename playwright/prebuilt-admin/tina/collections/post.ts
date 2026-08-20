import type { Collection } from 'tinacms';
import { FixtureField } from '../fields/fixture-field';

export const post: Collection = {
  label: 'Posts',
  name: 'post',
  path: 'content/post',
  format: 'mdx',
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      isTitle: true,
      required: true,
    },
    {
      // Colocated custom field component (JSX through the schema seam).
      type: 'string',
      name: 'marker',
      label: 'Marker',
      ui: {
        component: FixtureField,
      },
    },
    {
      type: 'rich-text',
      name: 'body',
      label: 'Body',
      isBody: true,
    },
  ],
};
