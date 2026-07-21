// Node-only — the Local Data Layer (ADR-018 §3): an fs-backed ContentProvider.
// A save writes the file and leaves it uncommitted; Tina runs no git locally.
// Hosted by whatever dev server is around (the playground mounts it as a Vite
// middleware; the CLI will mount the same handler).

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {
  ContentProvider,
  DocumentEntry,
} from '../../../core/content/contract';
import { invariant } from '../../../core/invariant';
import type { CollectionSchema } from '../../../core/schema/types';
import {
  type CollectionFormat,
  type FormatAdapter,
  formatAdapterFor,
} from './format-adapters';
import {
  type GraphQLPipeline,
  type GraphQLResult,
  type GraphQLVariables,
  createGraphQLPipeline,
} from './graphql-pipeline';

// The wire dispatch a host (express, a Next route) pairs with createLocalDataLayer.
export {
  type ContentRequest,
  dispatchContentRequest,
} from './content-request';

export interface LocalDataLayerOptions {
  // The project root document paths are relative to; collection `path`s resolve
  // against it.
  rootDir: string;
  collections: CollectionSchema[];
  // Per-format adapter overrides, merged over the built-ins (format-adapters.ts).
  formatAdapters?: Partial<Record<CollectionFormat, FormatAdapter>>;
}

// ContentProvider plus the v3 GraphQL read surface (graphql-pipeline.ts) —
// serving the website render path the same queries v3 served.
export interface LocalDataLayer extends ContentProvider {
  graphql(query: string, variables?: GraphQLVariables): Promise<GraphQLResult>;
}

interface ResolvedCollection {
  schema: CollectionSchema;
  adapter: FormatAdapter;
  absoluteFolder: string;
}

const resolveCollections = ({
  rootDir,
  collections,
  formatAdapters,
}: LocalDataLayerOptions): Map<string, ResolvedCollection> => {
  const resolved = new Map<string, ResolvedCollection>();
  for (const schema of collections) {
    invariant(
      schema.path,
      'content-collection-no-path',
      `Collection "${schema.name}" has no \`path\` — the local data layer needs one to locate its files.`
    );
    resolved.set(schema.name, {
      schema,
      adapter: formatAdapterFor(schema.format ?? 'md', formatAdapters),
      absoluteFolder: path.resolve(rootDir, schema.path),
    });
  }
  return resolved;
};

const isMissingFileError = (cause: unknown): boolean =>
  cause instanceof Error && (cause as NodeJS.ErrnoException).code === 'ENOENT';

export const createLocalDataLayer = (
  options: LocalDataLayerOptions
): LocalDataLayer => {
  const rootDir = path.resolve(options.rootDir);
  const collections = resolveCollections(options);

  // The v3 pipeline indexes every file at first use, so it boots lazily — a
  // session that never queries GraphQL never pays for it. Files stay the source
  // of truth: saves land on disk first, then refresh the index.
  let pipeline: Promise<GraphQLPipeline> | undefined;
  const graphQLPipeline = () => {
    if (!pipeline) {
      pipeline = createGraphQLPipeline({
        rootDir,
        collections: options.collections,
      }).catch((cause) => {
        // A failed boot must not be memoized forever — the next call retries.
        pipeline = undefined;
        throw cause;
      });
    }
    return pipeline;
  };

  const collectionFor = (name: string): ResolvedCollection => {
    const collection = collections.get(name);
    invariant(
      collection,
      'content-unknown-collection',
      `Unknown collection "${name}".`
    );
    return collection;
  };

  // Document paths come from the client — resolve and pin them inside the
  // collection's folder before any fs call (trust boundary).
  const resolveDocumentPath = (
    collection: ResolvedCollection,
    documentPath: string
  ): string => {
    const absolute = path.resolve(rootDir, documentPath);
    if (!absolute.startsWith(collection.absoluteFolder + path.sep)) {
      throw new Error(
        `Path "${documentPath}" is outside collection "${collection.schema.name}".`
      );
    }
    if (!absolute.endsWith(collection.adapter.extension)) {
      throw new Error(
        `Path "${documentPath}" is not a ${collection.adapter.extension} file in collection "${collection.schema.name}".`
      );
    }
    return absolute;
  };

  // The document id is the root-relative posix path (ADR-017) — derived from the
  // resolved absolute so a non-canonical client path (…/nested/../x.mdx) can't
  // leak into the index or the echoed entry.
  const documentIdFor = (absolute: string): string =>
    path.relative(rootDir, absolute).split(path.sep).join('/');

  return {
    async get(collectionName, documentPath) {
      const collection = collectionFor(collectionName);
      const absolute = resolveDocumentPath(collection, documentPath);
      let raw: string;
      try {
        raw = await fs.readFile(absolute, 'utf8');
      } catch (cause) {
        if (isMissingFileError(cause)) return null;
        throw cause;
      }
      return {
        path: documentIdFor(absolute),
        document: collection.adapter.parse(raw),
      };
    },

    async list(collectionName) {
      const collection = collectionFor(collectionName);
      let names: string[];
      try {
        names = await fs.readdir(collection.absoluteFolder, {
          recursive: true,
        });
      } catch (cause) {
        // A not-yet-created collection folder is an empty collection.
        if (isMissingFileError(cause)) return [];
        throw cause;
      }
      const entries: DocumentEntry[] = [];
      for (const name of names.sort()) {
        if (!name.endsWith(collection.adapter.extension)) continue;
        const absolute = path.join(collection.absoluteFolder, name);
        try {
          const raw = await fs.readFile(absolute, 'utf8');
          entries.push({
            path: documentIdFor(absolute),
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
      const canonicalPath = documentIdFor(absolute);
      // Merge over the file's current contents so unknown fields and the body
      // survive (format-adapters.ts); a missing file is written fresh — never
      // lose the edit (ADR-018).
      let previousRaw: string | undefined;
      try {
        previousRaw = await fs.readFile(absolute, 'utf8');
      } catch (cause) {
        if (!isMissingFileError(cause)) throw cause;
      }
      // An isBody field is the markdown body, not frontmatter — a client
      // echoing it back must not land the rich-text AST in the YAML merge
      // (previousRaw still owns the real body).
      const bodyFields = new Set(
        collection.schema.fields
          .filter((field) => field.isBody)
          .map((field) => field.name)
      );
      const frontmatter = Object.fromEntries(
        Object.entries(value).filter(([key]) => !bodyFields.has(key))
      );
      const raw = collection.adapter.serialize(frontmatter, previousRaw);
      // The parent folder may have been deleted out-of-band — same promise.
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, raw);
      // Keep the GraphQL index in step with the save — only once it exists;
      // a not-yet-booted pipeline indexes everything fresh on first query.
      // Deliberately no fs watcher: out-of-band edits go stale until the
      // next save; add chokidar when that bites.
      if (pipeline) {
        const readyPipeline = await pipeline;
        try {
          await readyPipeline.reindexPaths([canonicalPath]);
        } catch (cause) {
          // The file is already written — a reindex failure must not fail the
          // save; the index self-heals on the next successful reindex/boot.
          console.warn(`Reindex failed for "${canonicalPath}":`, cause);
        }
      }
      return { path: canonicalPath, document: collection.adapter.parse(raw) };
    },

    graphql: async (query, variables) => {
      const readyPipeline = await graphQLPipeline();
      return readyPipeline.execute(query, variables);
    },
  };
};
