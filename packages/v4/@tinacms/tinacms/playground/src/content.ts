import { type CollectionSchema, type TinaDocument, t } from '@tinacms/tinacms';

// The hardcoded documents this playground edits — two of them, so form
// continuity (kept edits across a switch) and the collection-level dirty/error
// dots have something to switch between. The data layer (ADR-019) replaces
// this with real content once it lands.

export const postCollection: CollectionSchema = {
  name: 'post',
  label: 'Posts',
  fields: [
    t.string({ name: 'title', label: 'Title', required: true, min: 3 }),
    t.boolean({ name: 'featured', label: 'Featured' }),
  ],
};

export interface PlaygroundDocument {
  path: string;
  document: TinaDocument;
}

export const documents: PlaygroundDocument[] = [
  {
    path: 'content/posts/hello-world.mdx',
    document: { title: 'Hello World', featured: false },
  },
  {
    path: 'content/posts/second-post.mdx',
    document: { title: 'Second Post', featured: true },
  },
];

// The standalone preview's static seed (/preview.html opened directly).
export const sampleDocument: TinaDocument = documents[0].document;
