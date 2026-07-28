import { type CollectionSchema, type TinaDocument, t } from '@tinacms/tinacms';
import { postCollectionMeta } from './collection-meta';

// Real documents live in playground/content/posts/ and arrive through the
// content slice (localContentPlugin → tinaLocalDataLayerVitePlugin's endpoint).

export const postCollection: CollectionSchema = {
  ...postCollectionMeta,
  label: 'Posts',
  fields: [
    t.string({ name: 'title', label: 'Title', required: true, min: 3 }),
    t.boolean({ name: 'featured', label: 'Featured' }),
    t.richText({ name: 'body', label: 'Body', isBody: true }),
  ],
};

// Static seed for /preview.html opened standalone. `satisfies`, not an
// annotation: useTina is generic, so keeping the literal shape lets the preview
// read `body` as the mdx AST instead of casting it back out of `unknown`.
export const sampleDocument = {
  title: 'Hello World',
  featured: false,
  body: {
    type: 'root',
    children: [
      {
        type: 'p',
        children: [{ type: 'text', text: 'Body prose, edited as markdown.' }],
      },
    ],
  },
} satisfies TinaDocument;
