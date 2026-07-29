// The local data layer (ADR-018 §3). It runs in Node only, and it is a
// ContentProvider that reads and writes files. A save writes the file and does not
// commit it, because Tina runs no git commands locally. The dev server that is
// available hosts it. The playground mounts it as a Vite middleware, and the CLI
// mounts the same handler.

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
  adapterForPath,
  formatAdaptersFor,
} from './format-adapters';
import {
  type GraphQLPipeline,
  type GraphQLResult,
  type GraphQLVariables,
  createGraphQLPipeline,
} from './graphql-pipeline';

// The wire dispatch that a host pairs with createLocalDataLayer. A host is an express
// server, or a Next.js route.
export {
  type ContentRequest,
  dispatchContentRequest,
} from './content-request';

export interface LocalDataLayerOptions {
  // The project root. The document paths and the collection paths are relative to it.
  rootDir: string;
  collections: CollectionSchema[];
  // The adapter overrides for each format. They merge over the built-in adapters in
  // format-adapters.ts.
  formatAdapters?: Partial<Record<CollectionFormat, FormatAdapter>>;
}

// A ContentProvider with the v3 GraphQL read interface from graphql-pipeline.ts. It
// serves the website the same queries that v3 served.
export interface LocalDataLayer extends ContentProvider {
  graphql(query: string, variables?: GraphQLVariables): Promise<GraphQLResult>;
}

interface ResolvedCollection {
  schema: CollectionSchema;
  // One adapter for each declared format, in schema order. Refer to
  // format-adapters.ts. The extension of a file selects the adapter that reads and
  // writes it, so a collection can hold .mdx and .json documents together.
  adapters: FormatAdapter[];
  absoluteFolder: string;
  // The name of the `isBody` field, if the collection declares one. That field holds
  // the markdown body. Refer to format-adapters.ts. A file has one body, so a
  // collection has one such field. A format with no body, such as JSON, ignores this
  // name and stores the field with the other values.
  bodyField?: string;
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
    // A file has one body, so two `isBody` fields are a schema error. There is no
    // correct way to resolve them. A silent choice of one field would write the
    // other one into the frontmatter. This check runs at construction, like the
    // check for a missing path above, so the error appears at boot and not at the
    // first save.
    // TODO: this schema validation sits in the file provider, because that provider
    // is the first code that reads a collection. Move it to defineConfig (ADR-024),
    // so that every provider gets it.
    const bodyFields = schema.fields.filter((field) => field.isBody);
    invariant(
      bodyFields.length <= 1,
      'content-multiple-body-fields',
      `Collection "${schema.name}" marks ${bodyFields.length} fields \`isBody\` — a file has one body, so mark one field.`
    );
    resolved.set(schema.name, {
      schema,
      adapters: formatAdaptersFor(schema.format, formatAdapters),
      absoluteFolder: path.resolve(rootDir, schema.path),
      bodyField: bodyFields[0]?.name,
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

  // The v3 pipeline indexes every file at its first use, so it boots late. A session
  // that runs no GraphQL query does not pay that cost. The files stay the source of
  // truth. A save writes to disk first, and then refreshes the index.
  let pipeline: Promise<GraphQLPipeline> | undefined;
  const graphQLPipeline = () => {
    if (!pipeline) {
      pipeline = createGraphQLPipeline({
        rootDir,
        collections: options.collections,
      }).catch((cause) => {
        // Do not keep a failed boot. The next call tries again.
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

  // The document paths come from the client, so this is a trust boundary. Resolve
  // each path, and keep it inside the folder of the collection, before any file call.
  // The extension check and the adapter lookup answer one question, so they run
  // together.
  const resolveDocumentPath = (
    collection: ResolvedCollection,
    documentPath: string
  ): { absolute: string; adapter: FormatAdapter } => {
    const absolute = path.resolve(rootDir, documentPath);
    if (!absolute.startsWith(collection.absoluteFolder + path.sep)) {
      throw new Error(
        `Path "${documentPath}" is outside collection "${collection.schema.name}".`
      );
    }
    const adapter = adapterForPath(collection.adapters, absolute);
    if (!adapter) {
      const extensions = collection.adapters
        .map((each) => each.extension)
        .join(' or ');
      throw new Error(
        `Path "${documentPath}" is not a ${extensions} file in collection "${collection.schema.name}".`
      );
    }
    return { absolute, adapter };
  };

  // The document id is the posix path from the root (ADR-017). It comes from the
  // resolved absolute path, so a client path such as …/nested/../x.mdx cannot reach
  // the index or the returned entry.
  const documentIdFor = (absolute: string): string =>
    path.relative(rootDir, absolute).split(path.sep).join('/');

  return {
    async get(collectionName, documentPath) {
      const collection = collectionFor(collectionName);
      const { absolute, adapter } = resolveDocumentPath(
        collection,
        documentPath
      );
      let raw: string;
      try {
        raw = await fs.readFile(absolute, 'utf8');
      } catch (cause) {
        if (isMissingFileError(cause)) return null;
        throw cause;
      }
      return {
        path: documentIdFor(absolute),
        document: adapter.parse(raw, collection.bodyField),
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
        // A collection folder that does not exist yet is an empty collection.
        if (isMissingFileError(cause)) return [];
        throw cause;
      }
      const entries: DocumentEntry[] = [];
      for (const name of names.sort()) {
        // No adapter owns this extension, so the collection does not claim the file.
        const adapter = adapterForPath(collection.adapters, name);
        if (!adapter) continue;
        const absolute = path.join(collection.absoluteFolder, name);
        try {
          const raw = await fs.readFile(absolute, 'utf8');
          entries.push({
            path: documentIdFor(absolute),
            document: adapter.parse(raw, collection.bodyField),
          });
        } catch (cause) {
          // One damaged or unreadable file must not stop the whole collection.
          console.warn(`Skipping unreadable document "${absolute}":`, cause);
        }
      }
      return entries;
    },

    async update(collectionName, documentPath, value) {
      const collection = collectionFor(collectionName);
      const { absolute, adapter } = resolveDocumentPath(
        collection,
        documentPath
      );
      const canonicalPath = documentIdFor(absolute);
      // Merge over the current contents of the file, so the unknown fields and the
      // body stay. Refer to format-adapters.ts. If the file does not exist, write a
      // new one. Never lose the edit (ADR-018).
      let previousRaw: string | undefined;
      try {
        previousRaw = await fs.readFile(absolute, 'utf8');
      } catch (cause) {
        if (!isMissingFileError(cause)) throw cause;
      }
      // The adapter writes an isBody field to the markdown body, and not to the
      // YAML. A save that omits that field leaves the body as it is.
      const raw = adapter.serialize(value, previousRaw, collection.bodyField);
      // Another program can delete the parent folder, so make it again.
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, raw);
      // Keep the GraphQL index in step with the save, but only after the index
      // exists. A pipeline that has not booted indexes every file at its first
      // query. There is no file watcher. An edit from another program stays stale
      // until the next save.
      if (pipeline) {
        const readyPipeline = await pipeline;
        try {
          await readyPipeline.reindexPaths([canonicalPath]);
        } catch (cause) {
          // The file is written, so a failed reindex must not fail the save. The
          // next reindex or boot repairs the index.
          console.warn(`Reindex failed for "${canonicalPath}":`, cause);
        }
      }
      return {
        path: canonicalPath,
        document: adapter.parse(raw, collection.bodyField),
      };
    },

    graphql: async (query, variables) => {
      const readyPipeline = await graphQLPipeline();
      return readyPipeline.execute(query, variables);
    },
  };
};
