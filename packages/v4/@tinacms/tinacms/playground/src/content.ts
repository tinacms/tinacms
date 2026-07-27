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

// Static seed for /preview.html opened standalone (outside the editor iframe).
export const sampleDocument: TinaDocument = {
  title: 'Hello World',
  featured: false,
  body: '\nBody prose, edited as markdown.\n',
};
