/**
 * Shared Tina field schemas used across multiple block definitions.
 * Centralises common field patterns so they stay in sync.
 */

/** Creates a slugify function with a collection-specific fallback prefix. */
export const makeSlugify = (prefix: string) => (values: any) =>
  `${(values?.title || `${prefix}-${Date.now()}`).toLowerCase().split(' ').join('-')}`;

/** Reusable tags reference list field used by the post collection. */
export const tagsFieldSchema = {
  type: 'object' as const,
  label: 'Tags',
  name: 'tags',
  list: true,
  fields: [
    {
      type: 'reference' as const,
      label: 'Tag',
      name: 'tag',
      collections: ['tag'],
    },
  ],
};

/** Reusable publish-date / updated-date field pair. */
export const dateFieldSchemas = [
  {
    type: 'datetime' as const,
    label: 'Publish Date',
    name: 'pubDate',
  },
  {
    type: 'datetime' as const,
    label: 'Updated Date',
    name: 'updatedDate',
  },
];
