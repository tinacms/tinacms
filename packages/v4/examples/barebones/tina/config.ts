// The one declaration of the content model. Two consumers import it: vite.config.ts
// runs it in node to start the local data layer, and tina/admin.tsx (scaffolded by
// codegen) imports it in the browser to render the admin. Node can import it, because
// the universal entry keeps the browser code behind lazy segments.

import {
  type CollectionSchema,
  defineConfig,
  localContentPlugin,
  required,
  t,
} from '@tinacms/tinacms';
import { hooksPlugin, logSave, requireStarsToPublish } from './hooks';
import { rating, ratingFieldPlugin } from './rating-field';
import { differentFrom, matches, validatorsPlugin } from './validators';

export const postCollection = {
  name: 'post',
  label: 'Posts',
  path: 'content/posts',
  format: 'mdx',
  hooks: [requireStarsToPublish(), logSave('saved')],
  fields: [
    t.string({
      name: 'title',
      label: 'Title',
      validators: [
        required(),
        matches('^[A-Z]', 'Start with a capital letter'),
      ],
    }),
    t.boolean({ name: 'featured', label: 'Featured' }),
    // The custom field of this project. tina/rating-field.tsx is the whole plugin.
    rating({ name: 'stars', label: 'Stars' }),
    t.richText({ name: 'body', label: 'Body', isBody: true }),
    t.array({
      name: 'authors',
      label: 'Authors',
      fields: [
        t.string({ name: 'name', label: 'Name' }),
        t.string({
          name: 'alias',
          label: 'Alias',
          // A sibling rule: `siblings` is this author, not the document root.
          validators: [
            differentFrom('name', 'Alias must differ from the name'),
          ],
        }),
      ],
    }),
    t.reference({
      collections: ['page'],
      name: 'pages',
      label: 'Pages Reference',
    }),
    t.select({
      name: 'status',
      label: 'Status',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
      ],
    }),
    t.object({
      name: 'seo',
      label: 'SEO',
      fields: [
        t.string({ name: 'title', label: 'Title', validators: [required()] }),
        t.string({ name: 'description', label: 'Description' }),
      ],
    }),
  ],
} satisfies CollectionSchema;

export const pageCollection = {
  name: 'page',
  label: 'Pages',
  path: 'content/pages',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title', validators: [required()] }),
    t.boolean({ name: 'featured', label: 'Featured' }),
  ],
} satisfies CollectionSchema;

export default defineConfig({
  plugins: [
    localContentPlugin(),
    ratingFieldPlugin,
    validatorsPlugin,
    hooksPlugin,
  ],
  schema: { collections: [postCollection, pageCollection] },
});
