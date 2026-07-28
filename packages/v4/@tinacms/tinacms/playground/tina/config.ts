// The playground's composition root, standing in for a real app's tina/config.ts.
// Two consumers import THIS file: the browser app (app.tsx) and the Vite config,
// which runs it in node to boot the Local Data Layer. That is the point — the
// collection was previously declared twice, once at wire level for the data layer
// and once with the `t.*` builders for the form, and the two could drift.
//
// Importable from node because the universal entry keeps browser code behind lazy
// segments: `localContentPlugin()` names its client with `() => import(...)`, and
// the `t.*` builders are plain schema, so neither React nor Plate is pulled in.

import {
  type CollectionSchema,
  defineConfig,
  localContentPlugin,
  t,
} from '@tinacms/tinacms';

export const postCollection = {
  name: 'post',
  label: 'Posts',
  path: 'content/posts',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title', required: true, min: 3 }),
    t.boolean({ name: 'featured', label: 'Featured' }),
    // v3 content model: the markdown body, served by GraphQL as the mdx AST.
    t.richText({ name: 'body', label: 'Body', isBody: true }),
  ],
} satisfies CollectionSchema;

export default defineConfig({
  plugins: [localContentPlugin()],
  schema: { collections: [postCollection] },
});
