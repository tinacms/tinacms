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
  schema: { collections: [postCollection, pageCollection] },
});
