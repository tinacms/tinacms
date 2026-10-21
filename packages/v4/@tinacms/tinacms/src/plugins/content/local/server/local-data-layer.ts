import type { Dirent } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  type ContentProvider,
  ContentWriteError,
  type DocumentSummary,
} from '../../../../core/content/contract';
import { invariant } from '../../../../core/invariant';
import type { CollectionSchema } from '../../../../core/schema/types';
import { isMissingFileError, realPathOf } from '../../../../server/real-path';
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
  // The repo-relative path a save of `documentPath` in `collection` writes to.
  canonicalPath(collection: string, documentPath: string): Promise<string>;
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

const FILE_SYSTEM_REASONS: Record<string, string> = {
  EACCES: 'permission denied',
  EPERM: 'permission denied',
  EROFS: 'the file system is read-only',
  ENOSPC: 'the disk is full',
  EISDIR: 'a folder has that name',
  ENOTDIR: 'a parent of the file is not a folder',
};

const fileSystemReasonOf = (cause: unknown): string => {
  if (cause instanceof Error && 'code' in cause) {
    const reason = FILE_SYSTEM_REASONS[String(cause.code)];
    if (reason) return reason;
  }
  return 'the file system refused the write';
};

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
  ): Promise<{
    absolute: string;
    realAbsolute: string;
    adapter: FormatAdapter;
  }> => {
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
    if (
      !absolute.startsWith(collection.absoluteFolder + path.sep) ||
      !realAbsolute.startsWith(realFolder + path.sep)
    ) {
      throw new ContentWriteError(
        `Path "${documentPath}" is outside collection "${collection.schema.name}".`
      );
    }
    const adapter = adapterForPath(collection.adapters, absolute);
    if (!adapter) {
      throw new ContentWriteError(
        `Path "${documentPath}" is not a ${collection.adapters
          .map((each) => each.extension)
          .join(' or ')} file in collection "${collection.schema.name}".`
      );
    }
    return { absolute, realAbsolute, adapter };
  };

  // Collection folders can nest and can share a folder across formats, so a
  // file belongs to the deepest folder whose collection reads its format.
  const ownerOf = async (
    realAbsolute: string
  ): Promise<ResolvedCollection | undefined> => {
    const folders = await Promise.all(
      [...collections.values()].map(async (candidate) => ({
        candidate,
        realFolder: await realPathOf(candidate.absoluteFolder),
      }))
    );
    return folders
      .filter(
        ({ candidate, realFolder }) =>
          realAbsolute.startsWith(realFolder + path.sep) &&
          adapterForPath(candidate.adapters, realAbsolute)
      )
      .sort((a, b) => b.realFolder.length - a.realFolder.length)[0]?.candidate;
  };

  const documentIdFor = (absolute: string): string =>
    path.relative(rootDir, absolute).split(path.sep).join('/');

  let realRoot: Promise<string> | undefined;
  const realDocumentIdFor = async (realAbsolute: string): Promise<string> => {
    realRoot ??= realPathOf(rootDir);
    return path
      .relative(await realRoot, realAbsolute)
      .split(path.sep)
      .join('/');
  };

  const resolveOwnedPath = async (
    collection: ResolvedCollection,
    documentPath: string
  ) => {
    const resolved = await resolveDocumentPath(collection, documentPath);
    const canonicalPath = await realDocumentIdFor(resolved.realAbsolute);
    const owner = await ownerOf(resolved.realAbsolute);
    if (owner !== collection) {
      throw new ContentWriteError(
        `Cannot save "${canonicalPath}" in collection "${collection.schema.name}": the file belongs to collection "${owner?.schema.name}".`
      );
    }
    return { ...resolved, canonicalPath };
  };

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
    async canonicalPath(collectionName, documentPath) {
      return (
        await resolveOwnedPath(collectionFor(collectionName), documentPath)
      ).canonicalPath;
    },

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
      let dirents: Dirent[];
      try {
        dirents = await fs.readdir(collection.absoluteFolder, {
          recursive: true,
          withFileTypes: true,
        });
      } catch (cause) {
        if (isMissingFileError(cause)) return [];
        throw new Error(
          `Cannot read the folder of collection "${collection.schema.name}" at "${collection.absoluteFolder}".`,
          { cause }
        );
      }
      const files = dirents
        .filter((dirent) => !dirent.isDirectory())
        .map((dirent) => path.join(dirent.parentPath, dirent.name))
        .sort();
      const summaries: DocumentSummary[] = [];
      for (const absolute of files) {
        if (!adapterForPath(collection.adapters, absolute)) continue;
        let realAbsolute: string;
        try {
          ({ realAbsolute } = await resolveDocumentPath(collection, absolute));
        } catch (cause) {
          console.warn(
            `Skipping document "${absolute}": it does not resolve inside collection "${collection.schema.name}".`,
            cause
          );
          continue;
        }
        if ((await ownerOf(realAbsolute)) !== collection) continue;
        summaries.push({ path: documentIdFor(absolute) });
      }
      return summaries;
    },

    async update(collectionName, documentPath, value) {
      const collection = collectionFor(collectionName);
      const { realAbsolute, adapter, canonicalPath } = await resolveOwnedPath(
        collection,
        documentPath
      );
      const refusedWrite = (cause: unknown) =>
        new ContentWriteError(
          `Cannot save "${canonicalPath}": ${fileSystemReasonOf(cause)}.`
        );
      return afterPendingSaves(canonicalPath, async () => {
        let previousRaw: string | undefined;
        try {
          previousRaw = await fs.readFile(realAbsolute, 'utf8');
        } catch (cause) {
          if (!isMissingFileError(cause)) throw refusedWrite(cause);
        }
        let raw: string;
        try {
          raw = adapter.serialize(
            value,
            previousRaw,
            collection.bodyField,
            collection.schema.fields.map((field) => field.name)
          );
        } catch (cause) {
          let reason: string;
          if (cause instanceof Error) {
            reason = cause.message;
          } else {
            reason = String(cause);
          }
          throw new ContentWriteError(
            isUnparsable(adapter, previousRaw, collection.bodyField)
              ? `Cannot save "${canonicalPath}": the contents of the file on disk could not be parsed (${reason}). Repair the file, then save again.`
              : `Cannot save "${canonicalPath}": ${reason}`
          );
        }
        try {
          await fs.mkdir(path.dirname(realAbsolute), { recursive: true });
          await fs.writeFile(realAbsolute, raw);
        } catch (cause) {
          throw refusedWrite(cause);
        }
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
