/**
 * Shared Tina field schemas used across multiple block definitions.
 * Centralises common field patterns so they stay in sync.
 */

/** Creates a slugify function with a collection-specific fallback prefix. */
export const makeSlugify = (prefix: string) => (values: any) =>
  `${(values?.title || `${prefix}-${Date.now()}`).toLowerCase().split(' ').join('-')}`;

/** Reusable tags reference list field used by post and documentation collections. */
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

/** Reusable "actions" list field — buttons/links with label, type, link & icon. */
export const actionsFieldSchema = {
  label: 'Actions',
  name: 'actions',
  type: 'object',
  list: true,
  ui: {
    defaultItem: {
      label: 'Action Label',
      type: 'button',
      icon: true,
      link: '/',
    },
    itemProps: (item: any) => ({ label: item.label }),
  },
  fields: [
    {
      label: 'Label',
      name: 'label',
      type: 'string',
    },
    {
      label: 'Type',
      name: 'type',
      type: 'string',
      options: [
        { label: 'Button', value: 'button' },
        { label: 'Link', value: 'link' },
      ],
    },
    {
      label: 'Link',
      name: 'link',
      type: 'string',
    },
    {
      label: 'Icon',
      name: 'icon',
      type: 'boolean',
    },
  ],
};

/** Reusable color picker for section backgrounds (default / tint / primary). */
export const colorFieldSchema = {
  type: 'string',
  label: 'Color',
  name: 'color',
  options: [
    { label: 'Default', value: 'default' },
    { label: 'Tint', value: 'tint' },
    { label: 'Primary', value: 'primary' },
  ],
};
