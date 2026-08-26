// The one declaration of the content model. Two consumers import it: vite.config.ts
// runs it in node to start the local data layer, and tina/admin.tsx (scaffolded by
// codegen) imports it in the browser to render the admin. Node can import it, because
// the universal entry keeps the browser code behind lazy segments.

import {
  type CollectionSchema,
  defineConfig,
  localContentPlugin,
  t,
} from '@tinacms/tinacms';
import { rating, ratingFieldPlugin } from './rating-field';

export const postCollection = {
  name: 'post',
  label: 'Posts',
  path: 'content/posts',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title', required: true }),
    t.boolean({ name: 'featured', label: 'Featured' }),
    t.number({
      name: 'flat-validation-test',
      label: 'flat validation test',
      min: 10,
    }),
    // The custom field of this project. tina/rating-field.tsx is the whole plugin.
    rating({ name: 'stars', label: 'Stars' }),
    t.richText({ name: 'body', label: 'Body', isBody: true }),
    t.array({
      name: 'authors',
      label: 'Authors',
      fields: [
        {
          name: 'name',
          label: 'Name',
          type: 'string',
        },
      ],
    }),
  ],
} satisfies CollectionSchema;

export default defineConfig({
  plugins: [localContentPlugin(), ratingFieldPlugin],
  schema: { collections: [postCollection] },
});
