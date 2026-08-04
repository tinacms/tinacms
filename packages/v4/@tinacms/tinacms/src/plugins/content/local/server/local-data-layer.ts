import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {
  ContentProvider,
  DocumentEntry,
} from '../../../../core/content/contract';
import { invariant } from '../../../../core/invariant';
import type { CollectionSchema } from '../../../../core/schema/types';
import {
  type CollectionFormat,
  type FormatAdapter,
  adapterForPath,
  formatAdaptersFor,
} from '../adapters/format-adapters';
import {
  type GraphQLPipeline,
  type GraphQLResult,
  type GraphQLVariables,
  createGraphQLPipeline,
} from '../graphql/graphql-pipeline';

export {
  type ContentRequest,
  dispatchContentRequest,
} from './content-request';

export interface LocalDataLayerOptions {
  rootDir: string;
  collections: CollectionSchema[];
  formatAdapters?: Partial<Record<CollectionFormat, FormatAdapter>>;
}

export interface LocalDataLayer extends ContentProvider {
  graphql(query: string, variables?: GraphQLVariables): Promise<GraphQLResult>;
  close(): Promise<void>;
}

interface ResolvedCollection {
  schema: CollectionSchema;
  adapters: FormatAdapter[];
  absoluteFolder: string;
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
    // TODO: move this schema validation to defineConfig (ADR-024) so every
    // content plugin gets it, not the local data layer alone.
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
  cause instanceof Error && 'code' in cause && cause.code === 'ENOENT';

const isUnparsable = (
  adapter: FormatAdapter,
  raw: string | undefined,
  bodyField?: string
): boolean => {
  if (raw === undefined) return false;
  try {
    adapter.parse(raw, bodyField);
    return false;
  } catch {
    return true;
  }
};

const MAX_LINK_DEPTH = 40;

const linkTargetOf = async (candidate: string): Promise<string | undefined> => {
  try {
    const stats = await fs.lstat(candidate);
    if (!stats.isSymbolicLink()) return undefined;
    return await fs.readlink(candidate);
  } catch {
    return undefined;
  }
};

// `realpath` fails for a link that has no target, and the fallback below then
// resolves a path to itself. A link must resolve to its target, or the caller
// cannot see where a write lands.
const realPathOf = async (candidate: string, depth = 0): Promise<string> => {
  try {
    return await fs.realpath(candidate);
  } catch {
    const target = await linkTargetOf(candidate);
    if (target !== undefined) {
      invariant(
        depth < MAX_LINK_DEPTH,
        'content-path-link-depth',
        'A document path follows too many links.'
      );
      return realPathOf(
        path.resolve(path.dirname(candidate), target),
        depth + 1
      );
    }
    const parent = path.dirname(candidate);
    if (parent === candidate) return candidate;
    return path.join(await realPathOf(parent, depth), path.basename(candidate));
  }
};

export const createLocalDataLayer = (
  options: LocalDataLayerOptions
): LocalDataLayer => {
  const rootDir = path.resolve(options.rootDir);
  const collections = resolveCollections(options);

  let pipeline: Promise<GraphQLPipeline> | undefined;
  const graphQLPipeline = () => {
    if (!pipeline) {
      pipeline = createGraphQLPipeline({
        rootDir,
        collections: options.collections,
      }).catch((cause) => {
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

  const resolveDocumentPath = async (
    collection: ResolvedCollection,
    documentPath: string
  ): Promise<{ absolute: string; adapter: FormatAdapter }> => {
    invariant(
      !documentPath.includes('\0'),
      'content-path-null-byte',
      'A document path cannot hold a null byte.'
    );
    const absolute = path.resolve(rootDir, documentPath);
    const [realFolder, realAbsolute] = await Promise.all([
      realPathOf(collection.absoluteFolder),
      realPathOf(absolute),
    ]);
    invariant(
      absolute.startsWith(collection.absoluteFolder + path.sep) &&
        realAbsolute.startsWith(realFolder + path.sep),
      'content-path-outside-collection',
      `Path "${documentPath}" is outside collection "${collection.schema.name}".`
    );
    const adapter = adapterForPath(collection.adapters, absolute);
    invariant(
      adapter,
      'content-path-unknown-format',
      `Path "${documentPath}" is not a ${collection.adapters
        .map((each) => each.extension)
        .join(' or ')} file in collection "${collection.schema.name}".`
    );
    return { absolute, adapter };
  };

  const documentIdFor = (absolute: string): string =>
    path.relative(rootDir, absolute).split(path.sep).join('/');

  const savesByPath = new Map<string, Promise<unknown>>();
  const afterPendingSaves = <T>(
    canonicalPath: string,
    save: () => Promise<T>
  ): Promise<T> => {
    const pending = savesByPath.get(canonicalPath) ?? Promise.resolve();
    const run = pending.catch(() => {}).then(save);
    savesByPath.set(canonicalPath, run);
    const forget = () => {
      if (savesByPath.get(canonicalPath) === run) {
        savesByPath.delete(canonicalPath);
      }
    };
    run.then(forget, forget);
    return run;
  };

  return {
    async get(collectionName, documentPath) {
      const collection = collectionFor(collectionName);
      const { absolute, adapter } = await resolveDocumentPath(
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
        if (isMissingFileError(cause)) return [];
        throw new Error(
          `Cannot read the folder of collection "${collection.schema.name}" at "${collection.absoluteFolder}".`,
          { cause }
        );
      }
      const entries: DocumentEntry[] = [];
      for (const name of names.sort()) {
        const adapter = adapterForPath(collection.adapters, name);
        if (!adapter) continue;
        const absolute = path.join(collection.absoluteFolder, name);
        let raw: string;
        try {
          await resolveDocumentPath(collection, absolute);
          raw = await fs.readFile(absolute, 'utf8');
        } catch (cause) {
          console.warn(`Skipping unreadable document "${absolute}":`, cause);
          continue;
        }
        try {
          entries.push({
            path: documentIdFor(absolute),
            document: adapter.parse(raw, collection.bodyField),
          });
        } catch (cause) {
          let reason: string;
          if (cause instanceof Error) {
            reason = cause.message;
          } else {
            reason = String(cause);
          }
          entries.push({
            path: documentIdFor(absolute),
            document: {},
            error: reason,
          });
        }
      }
      return entries;
    },

    async update(collectionName, documentPath, value) {
      const collection = collectionFor(collectionName);
      const { absolute, adapter } = await resolveDocumentPath(
        collection,
        documentPath
      );
      const canonicalPath = documentIdFor(absolute);
      return afterPendingSaves(canonicalPath, async () => {
        let previousRaw: string | undefined;
        try {
          previousRaw = await fs.readFile(absolute, 'utf8');
        } catch (cause) {
          if (!isMissingFileError(cause)) throw cause;
        }
        let raw: string;
        try {
          raw = adapter.serialize(value, previousRaw, collection.bodyField);
        } catch (cause) {
          const reason = cause instanceof Error ? cause.message : String(cause);
          throw new Error(
            isUnparsable(adapter, previousRaw, collection.bodyField)
              ? `Cannot save "${canonicalPath}": the contents of the file on disk could not be parsed (${reason}). Repair the file, then save again.`
              : `Cannot save "${canonicalPath}": ${reason}`
          );
        }
        await fs.mkdir(path.dirname(absolute), { recursive: true });
        await fs.writeFile(absolute, raw);
        if (pipeline) {
          try {
            const readyPipeline = await pipeline;
            await readyPipeline.reindexPaths([canonicalPath]);
          } catch (cause) {
            console.warn(`Reindex failed for "${canonicalPath}":`, cause);
          }
        }
        return {
          path: canonicalPath,
          document: adapter.parse(raw, collection.bodyField),
        };
      });
    },

    graphql: async (query, variables) => {
      const readyPipeline = await graphQLPipeline();
      return readyPipeline.execute(query, variables);
    },

    close: async () => {
      const booted = pipeline;
      pipeline = undefined;
      if (!booted) return;
      const readyPipeline = await booted.catch(() => null);
      await readyPipeline?.close();
    },
  };
};
