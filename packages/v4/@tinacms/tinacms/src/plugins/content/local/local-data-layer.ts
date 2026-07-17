// Node-only — the Local Data Layer (ADR-018 §3): an fs-backed ContentProvider.
// A save writes the file and leaves it uncommitted; Tina runs no git locally.
// Hosted by whatever dev server is around (the playground mounts it as a Vite
// middleware; the CLI will mount the same handler).

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type {
  ContentProvider,
  DocumentEntry,
} from '../../../core/content/contract';
import type { CollectionSchema } from '../../../core/schema/types';
import { type FormatAdapter, formatAdapterFor } from './format-adapters';

export interface LocalDataLayerOptions {
  // The project root document paths are relative to; collection `path`s resolve
  // against it.
  rootDir: string;
  collections: CollectionSchema[];
}

interface ResolvedCollection {
  schema: CollectionSchema;
  adapter: FormatAdapter;
  // Absolute folder holding the collection's files.
  folder: string;
}

const resolveCollections = ({
  rootDir,
  collections,
}: LocalDataLayerOptions): Map<string, ResolvedCollection> => {
  const resolved = new Map<string, ResolvedCollection>();
  for (const schema of collections) {
    if (!schema.path) {
      throw new Error(
        `Collection "${schema.name}" has no \`path\` — the local data layer needs one to locate its files.`
      );
    }
    resolved.set(schema.name, {
      schema,
      adapter: formatAdapterFor(schema.format ?? 'md'),
      folder: path.resolve(rootDir, schema.path),
    });
  }
  return resolved;
};

export const createLocalDataLayer = (
  options: LocalDataLayerOptions
): ContentProvider => {
  const rootDir = path.resolve(options.rootDir);
  const collections = resolveCollections(options);

  const collectionFor = (name: string): ResolvedCollection => {
    const collection = collections.get(name);
    if (!collection) throw new Error(`Unknown collection "${name}".`);
    return collection;
  };

  // Document paths come from the client — resolve and pin them inside the
  // collection's folder before any fs call (trust boundary).
  const resolveDocumentPath = (
    collection: ResolvedCollection,
    documentPath: string
  ): string => {
    const absolute = path.resolve(rootDir, documentPath);
    if (
      !absolute.startsWith(collection.folder + path.sep) ||
      !absolute.endsWith(collection.adapter.extension)
    ) {
      throw new Error(
        `Path "${documentPath}" is outside collection "${collection.schema.name}".`
      );
    }
    return absolute;
  };

  return {
    async get(collectionName, documentPath) {
      const collection = collectionFor(collectionName);
      const absolute = resolveDocumentPath(collection, documentPath);
      let raw: string;
      try {
        raw = await fs.readFile(absolute, 'utf8');
      } catch (cause) {
        if ((cause as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw cause;
      }
      return { path: documentPath, document: collection.adapter.parse(raw) };
    },

    async list(collectionName) {
      const collection = collectionFor(collectionName);
      let names: string[];
      try {
        names = (await fs.readdir(collection.folder, { recursive: true })).map(
          String
        );
      } catch (cause) {
        // A not-yet-created collection folder is an empty collection.
        if ((cause as NodeJS.ErrnoException).code === 'ENOENT') return [];
        throw cause;
      }
      const entries: DocumentEntry[] = [];
      for (const name of names.sort()) {
        if (!name.endsWith(collection.adapter.extension)) continue;
        const absolute = path.join(collection.folder, name);
        try {
          const raw = await fs.readFile(absolute, 'utf8');
          entries.push({
            // Paths are the document id: root-relative posix (ADR-017).
            path: path.relative(rootDir, absolute).split(path.sep).join('/'),
            document: collection.adapter.parse(raw),
          });
        } catch (cause) {
          // One malformed or unreadable file must not take down the whole
          // collection.
          console.warn(`Skipping unreadable document "${absolute}":`, cause);
        }
      }
      return entries;
    },

    async update(collectionName, documentPath, value) {
      const collection = collectionFor(collectionName);
      const absolute = resolveDocumentPath(collection, documentPath);
      // Merge over the file's current contents so unknown fields and the body
      // survive (format-adapters.ts); a missing file is written fresh — never
      // lose the edit (ADR-018).
      let previousRaw: string | undefined;
      try {
        previousRaw = await fs.readFile(absolute, 'utf8');
      } catch (cause) {
        if ((cause as NodeJS.ErrnoException).code !== 'ENOENT') throw cause;
      }
      const raw = collection.adapter.serialize(value, previousRaw);
      // The parent folder may have been deleted out-of-band — same promise.
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, raw);
      return { path: documentPath, document: collection.adapter.parse(raw) };
    },
  };
};

// The wire protocol: one JSON request per operation, validated at the trust
// boundary. Transport-agnostic — the host (Vite middleware, express, a Next
// route) parses the HTTP body and JSONs the result back.
const contentRequestSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('list'), collection: z.string() }),
  z.object({ op: z.literal('get'), collection: z.string(), path: z.string() }),
  z.object({
    op: z.literal('update'),
    collection: z.string(),
    path: z.string(),
    value: z.record(z.string(), z.unknown()),
  }),
]);

export type ContentRequest = z.infer<typeof contentRequestSchema>;

export const handleContentRequest = async (
  provider: ContentProvider,
  request: unknown
): Promise<DocumentEntry[] | DocumentEntry | null> => {
  const parsed = contentRequestSchema.parse(request);
  switch (parsed.op) {
    case 'list':
      return provider.list(parsed.collection);
    case 'get':
      return provider.get(parsed.collection, parsed.path);
    case 'update':
      return provider.update(parsed.collection, parsed.path, parsed.value);
  }
};
