import { type CollectionSchema, type TinaDocument, t } from '@tinacms/tinacms';

// The single hardcoded document this playground edits — the data layer (ADR-019)
// replaces this with real content once it lands.
export const DOCUMENT_PATH = 'content/posts/hello-world.mdx';

export const postCollection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  fields: [
    t.string({ name: 'title', label: 'Title', required: true, min: 3 }),
    t.boolean({ name: 'featured', label: 'Featured' }),
  ],
};

export const sampleDocument: TinaDocument = {
  title: 'Hello World',
  featured: false,
};
