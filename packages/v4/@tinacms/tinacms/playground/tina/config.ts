import { min, required } from '@tinacms/tinacms';
import {
  type ArrayTemplateSchema,
  type CollectionSchema,
  defineConfig,
  definePlugin,
  localContentPlugin,
  localMediaPlugin,
  mediaManagerPlugin,
  t,
} from '@tinacms/tinacms';

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
    t.richText({ name: 'body', label: 'Body', isBody: true }),
  ],
} satisfies CollectionSchema;

const longTemplates = Array.from({ length: 10 }, (_, index) => ({
  name: `block${index + 1}`,
  label: `Template number ${index + 1} with a rather long name that must wrap`,
  previewImage: 'preview.svg',
  fields: [t.string({ name: 'text', label: 'Text' })],
})) satisfies ArrayTemplateSchema[];

export const pageCollection = {
  name: 'page',
  label: 'Pages',
  path: 'content/pages',
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
  ],
} satisfies CollectionSchema;

export default defineConfig({
  plugins: [localContentPlugin(), localMediaPlugin(), mediaManagerPlugin()],
  schema: {
    collections: [
      postCollection,
      pageCollection,
      authorCollection,
      globalCollection,
    ],
  },
});
