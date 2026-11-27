import { min, required } from '@tinacms/tinacms';
import {
  type ArrayTemplateSchema,
  type CollectionSchema,
  defineConfig,
  definePlugin,
  localContentPlugin,
  localMediaPlugin,
  mediaManagerPlugin,
  type RichTextFieldSchema,
  t,
} from '@tinacms/tinacms';
import { navDemoPlugin } from './nav-demo';

export const authorCollection = {
  name: 'author',
  label: 'Authors',
  path: 'content/authors',
  format: 'md',
  fields: [
    t.string({ name: 'name', label: 'Name', validators: [required()] }),
    t.string({ name: 'bio', label: 'Bio' }),
  ],
} satisfies CollectionSchema;

export const globalCollection = {
  name: 'global',
  label: 'Global',
  path: 'content/global',
  format: 'json',
  fields: [
    t.string({ name: 'siteName', label: 'Site name' }),
    t.array({
      name: 'nav',
      label: 'Navigation',
      fields: [
        t.string({ name: 'label', label: 'Label' }),
        t.string({ name: 'href', label: 'Link' }),
      ],
    }),
  ],
} satisfies CollectionSchema;

const heroBlock = {
  name: 'hero',
  label: 'Hero',
  fields: [
    t.string({ name: 'headline', label: 'Headline' }),
    t.string({ name: 'tagline', label: 'Tagline' }),
  ],
} satisfies ArrayTemplateSchema;

const quoteBlock = {
  name: 'quote',
  label: 'Quote',
  fields: [t.string({ name: 'text', label: 'Text' })],
} satisfies ArrayTemplateSchema;

export const postCollection = {
  name: 'post',
  label: 'Posts',
  path: 'content/posts',
  description: 'Posts for the playground blog.',
  format: 'mdx',
  fields: [
    t.string({
      name: 'title',
      label: 'Title',
      validators: [required(), min(3)],
    }),
    t.boolean({ name: 'featured', label: 'Featured' }),
    t.reference({ name: 'author', label: 'Author', collections: ['author'] }),
    t.object({
      name: 'seo',
      label: 'SEO',
      fields: [
        t.string({ name: 'title', label: 'SEO title' }),
        t.string({ name: 'description', label: 'SEO description' }),
        t.object({
          name: 'social',
          label: 'Social',
          fields: [t.string({ name: 'handle', label: 'Handle' })],
        }),
      ],
    }),
    t.array({
      name: 'blocks',
      label: 'Blocks',
      templates: [heroBlock, quoteBlock],
    }),
    t.reference({
      name: 'related',
      label: 'Related post',
      collections: ['post'],
    }),
    t.richText({ name: 'body', label: 'Body', isBody: true }),
  ],
  allowedActions: { canCreateNestedFolder: true },
} satisfies CollectionSchema;

const longTemplates = Array.from({ length: 10 }, (_, index) => ({
  name: `block${index + 1}`,
  label: `Template number ${index + 1} with a rather long name that must wrap`,
  previewImage: 'preview.svg',
  fields: [t.string({ name: 'text', label: 'Text' })],
})) satisfies ArrayTemplateSchema[];

const nestedRichText = {
  toolbar: ['heading', 'bold', 'italic', 'link', 'textColor'],
  headingLevels: ['h2'],
  textColors: [{ label: 'Brand', value: '#123456' }],
  showFloatingToolbar: false,
} satisfies NonNullable<RichTextFieldSchema['overrides']>;

export const pageCollection = {
  name: 'page',
  label: 'Pages',
  path: 'content/pages',
  description: 'Landing pages with visual and plain blocks.',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title' }),
    t.array({
      name: 'visual',
      label: 'Visual blocks',
      picker: 'grid',
      templates: longTemplates,
    }),
    t.array({
      name: 'plain',
      label: 'Plain blocks',
      picker: 'list',
      templates: longTemplates,
    }),
    t.image({ name: 'hero', label: 'Hero image' }),
    t.richText({ name: 'summary', label: 'Summary' }),
    t.object({
      name: 'section',
      label: 'Section',
      fields: [
        t.object({
          name: 'inner',
          label: 'Inner',
          fields: [
            t.richText({
              name: 'notes',
              label: 'Notes',
              overrides: nestedRichText,
            }),
          ],
        }),
      ],
    }),
    t.array({
      name: 'items',
      label: 'Items',
      fields: [
        t.string({ name: 'heading', label: 'Heading' }),
        t.richText({
          name: 'text',
          label: 'Text',
          overrides: nestedRichText,
        }),
      ],
    }),
  ],
  allowedActions: { canDelete: false, canDuplicate: false },
} satisfies CollectionSchema;

export const checklistCollection = {
  name: 'checklist',
  label: 'Checklists',
  path: 'content/checklists',
  description: 'Two required fields, for the error list.',
  format: 'mdx',
  fields: [
    t.string({ name: 'first', label: 'First', validators: [required()] }),
    t.string({ name: 'second', label: 'Second', validators: [required()] }),
    t.string({ name: 'note', label: 'Note' }),
    t.select({
      name: 'choice',
      label: 'Choice',
      options: [
        { value: 'short', label: 'Short' },
        {
          value: 'long',
          label: `${'A very long option label that must wrap or truncate '.repeat(2)}end`,
        },
      ],
    }),
    t.reference({
      name: 'related',
      label: 'Related post',
      collections: ['post'],
    }),
    t.array({
      name: 'gallery',
      label: 'Gallery',
      of: t.image({ name: 'item', label: 'Image' }),
    }),
  ],
} satisfies CollectionSchema;

export const manyRequiredCollection = {
  name: 'manyrequired',
  label: 'Many required',
  path: 'content/manyrequired',
  description: 'Twelve required fields, for the error count.',
  format: 'mdx',
  fields: [
    t.string({ name: 'note', label: 'Note' }),
    ...Array.from({ length: 12 }, (_, index) =>
      t.string({
        name: `f${index + 1}`,
        label: `Field ${index + 1}`,
        validators: [required()],
      })
    ),
  ],
} satisfies CollectionSchema;

const lockItem = [t.string({ name: 'text', label: 'Text' })];

export const lockableCollection = {
  name: 'lockable',
  label: 'Lockable',
  path: 'content/lockable',
  description: 'One list that can be edited and one that is disabled.',
  format: 'mdx',
  fields: [
    t.array({ name: 'open', label: 'Open list', fields: lockItem }),
    t.array({
      name: 'locked',
      label: 'Locked list',
      disabled: true,
      fields: lockItem,
    }),
  ],
} satisfies CollectionSchema;

export const seoDefaultsCollection = {
  name: 'seoDefaults',
  label: 'SEO defaults',
  path: 'content/seo',
  description: 'Hidden from the Admin UI lists. It opens by URL.',
  format: 'json',
  hidden: true,
  fields: [
    t.string({ name: 'title', label: 'Default title' }),
    t.string({ name: 'description', label: 'Default description' }),
  ],
} satisfies CollectionSchema;

export default defineConfig({
  plugins: [
    localContentPlugin(),
    localMediaPlugin(),
    mediaManagerPlugin(),
    navDemoPlugin,
  ],
  schema: {
    collections: [
      postCollection,
      pageCollection,
      authorCollection,
      globalCollection,
      checklistCollection,
      manyRequiredCollection,
      lockableCollection,
      seoDefaultsCollection,
    ],
  },
});
