// The one declaration of the content model. Two consumers import it: vite.config.ts
// runs it in node to start the local data layer, and tina/admin.tsx (scaffolded by
// codegen) imports it in the browser to render the admin. Node can import it, because
// the universal entry keeps the browser code behind lazy segments.

import {
  type CollectionSchema,
  defineConfig,
  localContentPlugin,
  localMediaPlugin,
  mediaManagerPlugin,
  required,
  t,
  type ArrayTemplateSchema,
  tinaCloud,
} from '@tinacms/tinacms';
import { helpNavPlugin } from './help-nav';
import { hooksPlugin, logSave, slug, trimTitle } from './hooks';
import { rating, ratingFieldPlugin } from './rating-field';
import {
  differentFrom,
  matches,
  requiredWhen,
  validatorsPlugin,
} from './validators';

const tinaCloudClientId: string | undefined = import.meta.env
  .TINA_PUBLIC_CLIENT_ID;

const isLocal = !tinaCloudClientId;

export const postCollection = {
  name: 'post',
  label: 'Posts',
  path: 'content/posts',
  format: 'mdx',
  hooks: [trimTitle(), ...(isLocal ? [slug()] : []), logSave('saved')],
  fields: [
    t.string({
      name: 'title',
      label: 'Title',
      validators: [
        required(),
        matches('^[A-Z]', 'Start with a capital letter'),
      ],
    }),
    t.string({
      name: 'slug',
      label: 'Slug',
      description: 'Filled in from the title when you save',
    }),
    // Hidden: no editor, but the stored value is kept on every save.
    t.string({ name: 'legacyId', hidden: true }),
    t.boolean({ name: 'featured', label: 'Featured' }),
    t.image({ name: 'heroImage', label: 'Hero image' }),
    // The custom field of this project. tina/rating-field.tsx is the whole plugin.
    rating({
      name: 'stars',
      label: 'Stars',
      // A sibling rule: `stars` is top level, so `siblings` is the document root.
      validators: [
        requiredWhen(
          'status',
          'published',
          'Rate the post before you publish it'
        ),
      ],
    }),
    t.richText({ name: 'body', label: 'Body', isBody: true }),
    t.array({
      name: 'authors',
      label: 'Authors',
      defaultItem: { name: 'New author' },
      itemLabel: (item) => item.name,
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
      defaultValue: 'draft',
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

const heroTemplate = {
  name: 'hero',
  label: 'Hero',
  defaultItem: { headline: 'A new hero' },
  itemLabel: (item) => item.headline,
  // Shown as a tile in the block picker, so `blocks` below gets the grid.
  previewImage: 'posts/llama.avif',
  fields: [
    t.string({ name: 'headline', label: 'Headline', validators: [required()] }),
    t.string({ name: 'tagline', label: 'Tagline' }),
  ],
} satisfies ArrayTemplateSchema;

const ctaTemplate = {
  name: 'cta',
  label: 'Call to action',
  fields: [
    t.string({ name: 'label', label: 'Label', validators: [required()] }),
    t.string({ name: 'link', label: 'Link' }),
  ],
} satisfies ArrayTemplateSchema;

export const pageCollection = {
  name: 'page',
  label: 'Pages',
  path: 'content/pages',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title', validators: [required()] }),
    t.boolean({ name: 'featured', label: 'Featured' }),
    t.array({
      name: 'tags',
      label: 'Tags',
      of: t.string({ name: 'tag', label: 'Tag' }),
    }),
    t.array({
      name: 'blocks',
      label: 'Blocks',
      picker: 'grid',
      templates: [heroTemplate, ctaTemplate],
    }),
  ],
} satisfies CollectionSchema;

export default defineConfig({
  plugins: [
    ...(isLocal
      ? [localContentPlugin(), localMediaPlugin()]
      : [tinaCloud({ clientId: tinaCloudClientId })]),
    mediaManagerPlugin(),
    ratingFieldPlugin,
    validatorsPlugin,
    hooksPlugin,
    helpNavPlugin,
  ],
  schema: { collections: [postCollection, pageCollection] },
});
