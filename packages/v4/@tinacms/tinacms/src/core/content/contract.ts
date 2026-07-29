import type { TinaDocument } from '../schema/types';

// A document with its identity. The path is the id (ADR-017). A path is relative to the
// project root, for example 'content/posts/hello.mdx'.
export interface DocumentEntry {
  path: string;
  document: TinaDocument;
}

// The abstract level of the `content` capability (ADR-019). Every data layer implements
// this set of operations. The layers are the local one in this package, TinaCloud, the
// self-hosted one, and a v3 provider that maps these operations onto the v3 GraphQL
// client. The client talks to this interface only, so a change of provider does not
// touch the editor.
//
// The set holds get, list, and update, which is the save (ADR-018). These operations
// wait for a consumer: create, delete, rename, cursor pagination, filter and sort on
// indexed fields, and the system metadata. The GraphQL wire format and the generated
// typed client also wait. They arrive with codegen (ADR-019 §2).
export interface ContentProvider {
  get(collection: string, path: string): Promise<DocumentEntry | null>;
  list(collection: string): Promise<DocumentEntry[]>;
  // The save. It writes the JSON content value. It also writes when the file is
  // absent, because a document that another program deleted must not lose the save of
  // the editor (ADR-018). It returns the stored result, which can hold more than
  // `value`. The unknown fields of the stored document merge into it.
  update(
    collection: string,
    path: string,
    value: TinaDocument
  ): Promise<DocumentEntry>;
}

// The contents of `get().content`. It is the ContentProvider above, and nothing more.
//
// It holds no cache. A data layer is a transport, and the caching policy — deduplicating
// concurrent reads, deciding when a read went stale, retrying a failed one — belongs to
// the one consumer that renders it. That consumer is the admin, and it uses React Query
// (content-queries.ts). An earlier version of this interface carried a
// `documents: Record<collection, DocumentEntry[]>` cache with its own load and save
// operations, which meant every data layer author re-implemented a fraction of a query
// client, each one differently.
//
// A rejection from `update` passes to the caller, so useFormSave leaves the form dirty.
// Refer to SaveHandler in context.ts.
export type ContentSlice = ContentProvider;

// The default mount path of the wire endpoint for the content capability. The client
// slice and the dev server that hosts the data layer both use it.
export const DEFAULT_CONTENT_URL = '/api/tina/content';
