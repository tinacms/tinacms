import { min, required } from '@tinacms/tinacms';
import {
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

export default defineConfig({
  plugins: [localContentPlugin()],
  schema: { collections: [postCollection] },
});
