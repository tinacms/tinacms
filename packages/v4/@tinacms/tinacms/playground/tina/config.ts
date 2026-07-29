// The composition root of the playground. It stands in for the tina/config.ts of a real
// app. Two consumers import this file: the browser app in app.tsx, and the Vite config,
// which runs it in node to start the local data layer. That is the point of the file. The
// collection was declared twice before, once at the wire level for the data layer and
// once with the `t.*` builders for the form, and the two could drift.
//
// Node can import it, because the universal entry keeps the browser code behind lazy
// segments. `localContentPlugin()` names its client with `() => import(...)`, and the
// `t.*` builders are plain schema. Neither React nor Plate is therefore loaded.

import {
  type CollectionSchema,
  defineConfig,
  localContentPlugin,
  t,
  definePlugin,
} from '@tinacms/tinacms';

export const postCollection = {
  name: 'post',
  label: 'Posts',
  path: 'content/posts',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title', required: true, min: 3 }),
    t.boolean({ name: 'featured', label: 'Featured' }),
    // The v3 content model. This is the markdown body, which GraphQL serves as the
    // MDX tree.
    t.richText({ name: 'body', label: 'Body', isBody: true }),
  ],
} satisfies CollectionSchema;

export default defineConfig({
  plugins: [localContentPlugin()],
  schema: { collections: [postCollection] },
});
