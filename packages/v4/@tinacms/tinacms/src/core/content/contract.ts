import type { TinaDocument } from '../schema/types';

// A document paired with its identity — the path IS the id (ADR-017); paths are
// project-root-relative ('content/posts/hello.mdx').
export interface DocumentEntry {
  path: string;
  document: TinaDocument;
}

// The abstract level of the `content` capability (ADR-019): the operation set every
// Data Layer implements — Local (fs, this package), TinaCloud, self-hosted, or a
// v3-compat provider translating these ops onto the v3 GraphQL client. The client
// side talks only to this interface, so swapping providers never touches the editor.
//
// Deliberately the slice-sized subset: get/list/update (the save, ADR-018). Absent
// until a consumer exists: create/delete/rename, cursor pagination, filter/sort on
// indexed fields, system metadata, and the GraphQL wire format + generated typed
// client (lands with codegen, ADR-019 §2).
export interface ContentProvider {
  get(collection: string, path: string): Promise<DocumentEntry | null>;
  list(collection: string): Promise<DocumentEntry[]>;
  // The save: writes the JSON content value. Also writes when the file is missing —
  // a document deleted out-of-band must not swallow the editor's pending save
  // (never lose the edit, ADR-018).
  update(collection: string, path: string, value: TinaDocument): Promise<void>;
}
