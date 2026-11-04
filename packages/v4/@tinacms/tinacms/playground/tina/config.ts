import { min, required } from '@tinacms/tinacms';
import {
  type ArrayTemplateSchema,
  type CollectionSchema,
  defineConfig,
  definePlugin,
  localContentPlugin,
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

const PREVIEW = `data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='#ddd'/></svg>"
)}`;

const longTemplates = Array.from({ length: 10 }, (_, index) => ({
  name: `block${index + 1}`,
  label: `Template number ${index + 1} with a rather long name that must wrap`,
  previewImage: PREVIEW,
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
  ],
} satisfies CollectionSchema;

export default defineConfig({
  plugins: [localContentPlugin()],
  schema: { collections: [postCollection, pageCollection] },
});
