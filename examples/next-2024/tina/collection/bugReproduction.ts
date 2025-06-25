import type { RichTextField, RichTextTemplate } from '@tinacms/schema-tools';
import type { Collection } from 'tinacms';

export const contentBlock: Collection = {
  name: 'contentBlock',
  label: 'Content Block',
  path: 'content/contentBlock',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'string',
      isTitle: true,
      required: true,
    },
    {
      name: 'body',
      label: 'Body',
      type: 'rich-text',
    },
  ],
};
const contentBlockTemplate: RichTextTemplate = {
  name: 'contentBlock',
  label: 'Content Block',
  inline: true,

  fields: [
    {
      name: 'title',
      label: 'Editor Display Text',
      type: 'string',
      isTitle: true,
      required: true,
    },
    {
      name: 'displayStyle',
      label: 'Display Style',
      type: 'string',
      options: ['Text Block', 'Dropbox', 'Inline'],
      ui: {
        format(value) {
          switch (value) {
            case 'text_block':
              return 'Text Block';
            case 'dropbox':
              return 'Dropbox';
            case 'inline':
              return 'Inline';
            default:
              return 'Dropbox';
          }
        },
        parse(value) {
          switch (value) {
            case 'Text Block':
              return 'text_block';
            case 'Dropbox':
              return 'dropbox';
            case 'Inline':
              return 'inline';
            default:
              return 'dropbox';
          }
        },
      },
    },
    {
      name: 'block',
      label: 'Content Block',
      type: 'reference',
      collections: ['contentBlock'],
      required: true,
    },
  ],
};

const richTextConfiguration: RichTextField = {
  name: 'override',
  label: 'override',
  type: 'rich-text',
  templates: [contentBlockTemplate],
  toolbarOverride: [
    'embed',
    'bold',
    'italic',
    'ol',
    'ul',
    'raw',
    'table',
  ] as const,
};

const PathwaySchema: Collection = {
  name: 'bugReproduction',
  label: 'Bug Reproduction',
  path: 'content/bugReproduction',
  format: 'mdx',

  fields: [
    {
      label: 'Scope',
      name: 'scope',
      type: 'object',
      fields: [
        {
          ...richTextConfiguration,
          name: 'content',
          label: 'Content',
        },
      ],
    },

    {
      type: 'string',
      name: 'title',
      label: 'Page Title',
      isTitle: true,
      required: true,
    },

    {
      ...richTextConfiguration,
      name: 'unstructured',
      label: 'Unstructured Content',
      type: 'rich-text',
    },
  ],
  // ui: {
  //   router: ({ document }) => {
  //     return `/pathway/${document._sys.filename}/editor`;
  //   },
  // },
};

export default PathwaySchema;
