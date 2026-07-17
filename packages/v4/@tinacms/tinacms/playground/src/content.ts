import { type CollectionSchema, type TinaDocument, t } from '@tinacms/tinacms';
import { postCollectionMeta } from './collection-meta';

// Real documents live in playground/content/posts/ and arrive through the
// content slice (localContentPlugin → vite.config.ts middleware).

export const postCollection: CollectionSchema = {
  ...postCollectionMeta,
  label: 'Posts',
  fields: [
    t.string({ name: 'title', label: 'Title', required: true, min: 3 }),
    t.boolean({ name: 'featured', label: 'Featured' }),
  ],
};

// Static seed for /preview.html opened standalone (outside the editor iframe).
export const sampleDocument: TinaDocument = {
  title: 'Hello World',
  featured: false,
};
