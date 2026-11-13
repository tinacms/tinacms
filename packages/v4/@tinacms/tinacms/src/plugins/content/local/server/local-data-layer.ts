import type { Dirent } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  CONTENT_ERROR_MESSAGES,
  type ContentProvider,
  ContentWriteError,
  type DocumentConnection,
  type DocumentEntry,
  type DocumentReferrer,
  type DocumentSummary,
  type FolderSummary,
  InvalidSaveInputError,
  type ListQuery,
  ProviderRefusalError,
  type ProviderRefusalCode,
  type RenameFolderResult,
  type RenameResult,
} from '../../../../core/content/contract';
import { queryDocuments } from '../../../../core/content/list-query';
import { collectReferences } from '../../../../core/form/references';
import { invariant } from '../../../../core/invariant';
import type {
  AllowedActions,
  CollectionSchema,
  TinaDocument,
} from '../../../../core/schema/types';
import { isMissingFileError, realPathOf } from '../../../../server/real-path';
import {
  type CollectionFormat,
  type FormatAdapter,
  adapterForPath,
  collectionFormats,
  formatAdaptersFor,
} from '../adapters/format-adapters';
import {
  type GraphQLPipeline,
  type GraphQLResult,
  type GraphQLVariables,
  createGraphQLPipeline,
} from '../graphql/graphql-pipeline';
import {
  folderPartsOf,
  isValidFileName,
  isValidName,
} from '../../../../core/content/names';
import { referencesCollection, rewriteReferences } from './reference-rewrite';
import { createWriteLock } from './write-lock';

export {
  type ContentRequest,
  dispatchContentRequest,
} from './content-request';

export interface LocalDataLayerOptions {
  rootDir: string;
  collections: CollectionSchema[];
  formatAdapters?: Partial<Record<CollectionFormat, FormatAdapter>>;
}

export interface UpdateOptions {
  /**
   * Whether a save to a path with no file may create it. The caller decides from
   * the session; the Data Layer then applies the switches and name rules of a
   * create (ADR-019 §5).
   */
  mayCreate?: boolean;
}

export interface RenameOptions {
  /**
   * Whether the caller holds `content:save`. A rename that rewrites a referrer in
   * another collection is refused without it (ADR-008 §2).
   */
  maySave?: boolean;
}

export interface LocalDataLayer extends ContentProvider {
  update(
    collection: string,
    path: string,
    value: TinaDocument,
    options?: UpdateOptions
  ): Promise<DocumentEntry>;
  create(
    collection: string,
    path: string,
    value: TinaDocument,
    template?: string
  ): Promise<DocumentEntry>;
  rename(
    collection: string,
    from: string,
    to: string,
    options?: RenameOptions
  ): Promise<RenameResult>;
  delete(collection: string, path: string): Promise<void>;
  referrers(collection: string, path: string): Promise<DocumentReferrer[]>;
  createFolder(collection: string, folder: string): Promise<FolderSummary>;
  renameFolder(
    collection: string,
    from: string,
    to: string,
    options?: RenameOptions
  ): Promise<RenameFolderResult>;
  deleteFolder(
    collection: string,
    folder: string
  ): Promise<{ deleted: string[] }>;
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

const modifiedTimeOf = async (
  absolute: string
): Promise<Pick<DocumentSummary, 'updatedAt'>> => {
  try {
    const { mtime } = await fs.stat(absolute);
    return { updatedAt: mtime.toISOString() };
  } catch {
    return {};
  }
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

const SYSTEM_FILES = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini']);
const PLACEHOLDER_PREFIX = '.gitkeep.';

const isPlaceholderName = (name: string): boolean =>
  name.startsWith(PLACEHOLDER_PREFIX);

const REFUSAL_MESSAGES = {
  nameTaken: CONTENT_ERROR_MESSAGES['name-taken'],
  invalidName: CONTENT_ERROR_MESSAGES['invalid-path'],
  folderNotOwned: CONTENT_ERROR_MESSAGES['folder-not-owned'],
} as const;

const refusal = (code: ProviderRefusalCode, message: string) =>
  new ProviderRefusalError(code, message);

interface OwnedDocument {
  absolute: string;
  realAbsolute: string;
  id: string;
  adapter: FormatAdapter;
}

interface Scan {
  files: string[];
  directories: string[];
}

interface Rewrite {
  document: OwnedDocument;
  collection: ResolvedCollection;
  previousRaw: string;
  nextRaw: string;
}

interface Undo {
  label: string;
  restore: () => Promise<void>;
  /** True when a failed restore left the file as it was, so nothing stays changed. */
  isUnchanged?: () => Promise<boolean>;
}

const exists = async (absolute: string): Promise<boolean> => {
  try {
    await fs.lstat(absolute);
    return true;
  } catch (cause) {
    if (isMissingFileError(cause)) return false;
    throw cause;
  }
};

const isDirectory = async (absolute: string): Promise<boolean> => {
  try {
    return (await fs.stat(absolute)).isDirectory();
  } catch {
    return false;
  }
};

export const createLocalDataLayer = (
  options: LocalDataLayerOptions
): LocalDataLayer => {
  const rootDir = path.resolve(options.rootDir);
  const collections = resolveCollections(options);
  const lock = createWriteLock();

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
    if (!collection) {
      throw new InvalidSaveInputError(`Unknown collection "${name}".`);
    }
    return collection;
  };

  const resolveDocumentPath = async (
    collection: ResolvedCollection,
    documentPath: string
  ): Promise<{
    absolute: string;
    realAbsolute: string;
    realFolder: string;
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
    return { absolute, realAbsolute, realFolder, adapter };
  };

  // Collection folders can nest and can share a folder across formats, so a
  // file belongs to the deepest folder whose collection reads its format.
  const ownerFolders = () =>
    Promise.all(
      [...collections.values()].map(async (candidate) => ({
        candidate,
        realFolder: await realPathOf(candidate.absoluteFolder),
      }))
    );

  const ownerIn = (
    folders: Awaited<ReturnType<typeof ownerFolders>>,
    realAbsolute: string
  ): ResolvedCollection | undefined =>
    folders
      .filter(
        ({ candidate, realFolder }) =>
          realAbsolute.startsWith(realFolder + path.sep) &&
          adapterForPath(candidate.adapters, realAbsolute)
      )
      .sort((a, b) => b.realFolder.length - a.realFolder.length)[0]?.candidate;

  const ownerOf = async (
    realAbsolute: string
  ): Promise<ResolvedCollection | undefined> =>
    ownerIn(await ownerFolders(), realAbsolute);

  const documentIdFor = (absolute: string): string =>
    path.relative(rootDir, absolute).split(path.sep).join('/');

  const resolveOwnedPath = async (
    collection: ResolvedCollection,
    documentPath: string
  ) => {
    const resolved = await resolveDocumentPath(collection, documentPath);
    // The real file, named under the folder the collection configures, so a
    // linked collection folder keeps its configured name.
    const canonicalPath = documentIdFor(
      path.join(
        collection.absoluteFolder,
        path.relative(resolved.realFolder, resolved.realAbsolute)
      )
    );
    const owner = await ownerOf(resolved.realAbsolute);
    if (owner !== collection) {
      throw new ContentWriteError(
        `Cannot save "${canonicalPath}" in collection "${collection.schema.name}": the file belongs to collection "${owner?.schema.name}".`
      );
    }
    return { ...resolved, canonicalPath };
  };

  const checkedDocument = async (
    collection: ResolvedCollection,
    documentPath: string
  ) => {
    if (documentPath.includes('\0')) {
      throw refusal('invalid-path', REFUSAL_MESSAGES.invalidName);
    }
    try {
      return await resolveOwnedPath(collection, documentPath);
    } catch (cause) {
      if (cause instanceof ContentWriteError) {
        throw refusal('invalid-path', cause.message);
      }
      throw cause;
    }
  };

  const folderIdFor = (collection: ResolvedCollection, parts: string[]) =>
    documentIdFor(path.join(collection.absoluteFolder, ...parts));

  const isForeignDirectory = async (
    collection: ResolvedCollection,
    realDirectory: string,
    folders?: Awaited<ReturnType<typeof ownerFolders>>
  ): Promise<boolean> => {
    const realFolder = await realPathOf(collection.absoluteFolder);
    return (folders ?? (await ownerFolders())).some(
      ({ candidate, realFolder: other }) =>
        candidate !== collection &&
        other.startsWith(realFolder + path.sep) &&
        (realDirectory === other || realDirectory.startsWith(other + path.sep))
    );
  };

  const checkedFolder = async (
    collection: ResolvedCollection,
    folder: string
  ) => {
    const parts = folderPartsOf(folder);
    if (!parts) throw refusal('invalid-path', REFUSAL_MESSAGES.invalidName);
    const [realFolder, real] = await Promise.all([
      realPathOf(collection.absoluteFolder),
      realPathOf(path.join(collection.absoluteFolder, ...parts)),
    ]);
    if (parts.length > 0 && !real.startsWith(realFolder + path.sep)) {
      throw refusal('invalid-path', REFUSAL_MESSAGES.invalidName);
    }
    return { parts, real, realFolder };
  };

  const scanCollection = async (
    collection: ResolvedCollection
  ): Promise<Scan | null> => {
    let dirents: Dirent[];
    try {
      dirents = await fs.readdir(collection.absoluteFolder, {
        recursive: true,
        withFileTypes: true,
      });
    } catch (cause) {
      if (isMissingFileError(cause)) return null;
      throw new Error(
        `Cannot read the folder of collection "${collection.schema.name}" at "${collection.absoluteFolder}".`,
        { cause }
      );
    }
    const at = (dirent: Dirent) => path.join(dirent.parentPath, dirent.name);
    return {
      files: dirents
        .filter((dirent) => !dirent.isDirectory())
        .map(at)
        .sort(),
      directories: dirents.filter((dirent) => dirent.isDirectory()).map(at),
    };
  };

  const ownedDocuments = async (
    collection: ResolvedCollection,
    scan: Scan
  ): Promise<OwnedDocument[]> => {
    const [realFolder, folders] = await Promise.all([
      realPathOf(collection.absoluteFolder),
      ownerFolders(),
    ]);
    const found = await Promise.all(
      scan.files.map(async (absolute): Promise<OwnedDocument | null> => {
        if (isPlaceholderName(path.basename(absolute))) return null;
        const adapter = adapterForPath(collection.adapters, absolute);
        if (!adapter) return null;
        const realAbsolute = await realPathOf(absolute);
        if (!realAbsolute.startsWith(realFolder + path.sep)) {
          console.warn(
            `Skipping document "${absolute}": it does not resolve inside collection "${collection.schema.name}".`
          );
          return null;
        }
        if (ownerIn(folders, realAbsolute) !== collection) return null;
        return { absolute, realAbsolute, id: documentIdFor(absolute), adapter };
      })
    );
    return found.filter((document) => document !== null);
  };

  const parsedTitleOf = (document: TinaDocument): string | undefined =>
    typeof document.title === 'string' && document.title !== ''
      ? document.title
      : undefined;

  const summarize = async (
    collection: ResolvedCollection,
    document: OwnedDocument
  ): Promise<DocumentSummary> => {
    let title: string | undefined;
    try {
      title = parsedTitleOf(
        document.adapter.parse(
          await fs.readFile(document.realAbsolute, 'utf8'),
          collection.bodyField
        )
      );
    } catch (cause) {
      console.warn(
        `Cannot read the title of "${document.id}" in collection "${collection.schema.name}".`,
        cause
      );
    }
    return {
      path: document.id,
      ...(title === undefined ? {} : { title }),
      ...(await modifiedTimeOf(document.realAbsolute)),
    };
  };

  const allows = (
    collection: ResolvedCollection,
    action: keyof AllowedActions
  ): boolean => collection.schema.allowedActions?.[action] !== false;

  const forbid = (message: string) => refusal('forbidden', message);

  // The server cannot tell a Duplicate's first save from a new document, so it
  // refuses a create only when both switches are off.
  const assertMayCreateDocument = (collection: ResolvedCollection) => {
    if (
      !allows(collection, 'canCreate') &&
      !allows(collection, 'canDuplicate')
    ) {
      throw forbid(
        `Collection "${collection.schema.name}" does not allow new documents.`
      );
    }
  };

  const assertMayCreateFolder = (
    collection: ResolvedCollection,
    depth: number
  ) => {
    if (!allows(collection, 'canCreateFolder')) {
      throw forbid(
        `Collection "${collection.schema.name}" does not allow new folders.`
      );
    }
    if (depth > 1 && !allows(collection, 'canCreateNestedFolder')) {
      throw forbid(
        `Collection "${collection.schema.name}" does not allow nested folders.`
      );
    }
  };

  const assertNewFileAllowed = async (
    collection: ResolvedCollection,
    target: { realAbsolute: string; realFolder: string; adapter: FormatAdapter }
  ) => {
    const name = path.basename(target.realAbsolute);
    if (!isValidFileName(name, target.adapter.extension)) {
      throw refusal('invalid-path', REFUSAL_MESSAGES.invalidName);
    }
    const parts = path
      .relative(target.realFolder, path.dirname(target.realAbsolute))
      .split(path.sep)
      .filter(Boolean);
    let current = target.realFolder;
    for (const [index, part] of parts.entries()) {
      current = path.join(current, part);
      if (await exists(current)) continue;
      if (!isValidName(part)) {
        throw refusal('invalid-path', REFUSAL_MESSAGES.invalidName);
      }
      assertMayCreateFolder(collection, index + 1);
    }
  };

  const savesByPath = new Map<string, Promise<unknown>>();
  const afterPendingSaves = <T>(
    realAbsolute: string,
    save: () => Promise<T>
  ): Promise<T> => {
    const pending = savesByPath.get(realAbsolute) ?? Promise.resolve();
    const run = pending.catch(() => {}).then(save);
    savesByPath.set(realAbsolute, run);
    const forget = () => {
      if (savesByPath.get(realAbsolute) === run) {
        savesByPath.delete(realAbsolute);
      }
    };
    run.then(forget, forget);
    return run;
  };

  const serializeFor = (
    collection: ResolvedCollection,
    adapter: FormatAdapter,
    canonicalPath: string,
    value: TinaDocument,
    previousRaw: string | undefined
  ): string => {
    try {
      return adapter.serialize(
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
  };

  const syncIndex = async ({
    removed = [],
    changed = [],
  }: {
    removed?: string[];
    changed?: string[];
  }) => {
    if (!pipeline) return;
    const indexed = (ids: string[]) =>
      ids.filter((id) => !isPlaceholderName(path.posix.basename(id)));
    try {
      const readyPipeline = await pipeline;
      if (removed.length > 0) await readyPipeline.removePaths(indexed(removed));
      if (changed.length > 0)
        await readyPipeline.reindexPaths(indexed(changed));
    } catch (cause) {
      console.warn('Reindex failed:', cause);
    }
  };

  const planRewrites = async (
    target: ResolvedCollection,
    moved: ReadonlyMap<string, string>
  ): Promise<Rewrite[]> => {
    const rewrites: Rewrite[] = [];
    for (const candidate of collections.values()) {
      if (!referencesCollection(candidate.schema.fields, target.schema.name)) {
        continue;
      }
      const scan = await scanCollection(candidate);
      if (!scan) continue;
      for (const document of await ownedDocuments(candidate, scan)) {
        const previousRaw = await fs.readFile(document.realAbsolute, 'utf8');
        let parsed: TinaDocument;
        try {
          parsed = document.adapter.parse(previousRaw, candidate.bodyField);
        } catch (cause) {
          console.warn(
            `Cannot check "${document.id}" for references: it does not parse.`,
            cause
          );
          continue;
        }
        const next = rewriteReferences(
          parsed,
          candidate.schema.fields,
          target.schema.name,
          (value) => moved.get(value)
        );
        if (next === parsed) continue;
        const nextRaw = serializeFor(
          candidate,
          document.adapter,
          document.id,
          next,
          previousRaw
        );
        if (nextRaw === previousRaw) continue;
        rewrites.push({
          document,
          collection: candidate,
          previousRaw,
          nextRaw,
        });
      }
    }
    return rewrites;
  };

  const assertMaySaveReferrers = (
    collection: ResolvedCollection,
    rewrites: Rewrite[],
    options: RenameOptions | undefined
  ) => {
    if (options?.maySave === true) return;
    if (rewrites.every((rewrite) => rewrite.collection === collection)) return;
    throw forbid(
      'This rename also updates documents in other collections, which needs the "content:save" permission.'
    );
  };

  const rollBack = async (undo: Undo[]): Promise<string[]> => {
    const stuck: string[] = [];
    for (const step of [...undo].reverse()) {
      try {
        await step.restore();
      } catch {
        if (!(await step.isUnchanged?.().catch(() => false))) {
          stuck.push(step.label);
        }
      }
    }
    return stuck;
  };

  const failedStructuralWrite = (
    action: string,
    cause: unknown,
    stuck: string[]
  ): ContentWriteError => {
    const base = `Cannot ${action}: ${fileSystemReasonOf(cause)}.`;
    if (stuck.length === 0) {
      return new ContentWriteError(`${base} Nothing was changed.`);
    }
    return new ContentWriteError(
      `${base} These files could not be put back and stay changed: ${stuck.join(', ')}.`
    );
  };

  const applyMove = async (
    action: string,
    move: { from: string; to: string },
    rewrites: Rewrite[],
    destinationOf: (realAbsolute: string) => string
  ) => {
    const undo: Undo[] = [];
    try {
      await fs.rename(move.from, move.to);
      undo.push({
        label: move.to,
        restore: () => fs.rename(move.to, move.from),
      });
      for (const rewrite of rewrites) {
        const destination = destinationOf(rewrite.document.realAbsolute);
        undo.push({
          label: rewrite.document.id,
          restore: () => fs.writeFile(destination, rewrite.previousRaw),
          isUnchanged: async () =>
            (await fs.readFile(destination, 'utf8')) === rewrite.previousRaw,
        });
        await fs.writeFile(destination, rewrite.nextRaw);
      }
    } catch (cause) {
      throw failedStructuralWrite(action, cause, await rollBack(undo));
    }
  };

  const isCaseOnlyChange = (from: string, to: string): boolean =>
    from !== to && from.toLowerCase() === to.toLowerCase();

  // `to` is taken when it exists, unless it is the same file as `from` under
  // another letter case on a case-insensitive file system.
  const isTaken = async (from: string, to: string): Promise<boolean> => {
    if (!(await exists(to))) return false;
    if (!isCaseOnlyChange(from, to)) return true;
    const [toStats, fromStats] = await Promise.all([
      fs.stat(to),
      fs.stat(from),
    ]);
    return toStats.ino !== fromStats.ino || toStats.dev !== fromStats.dev;
  };

  const referrersOf = async (
    target: ResolvedCollection,
    targetId: string
  ): Promise<DocumentReferrer[]> => {
    const found: DocumentReferrer[] = [];
    for (const candidate of collections.values()) {
      if (!referencesCollection(candidate.schema.fields, target.schema.name)) {
        continue;
      }
      const scan = await scanCollection(candidate);
      if (!scan) continue;
      for (const document of await ownedDocuments(candidate, scan)) {
        if (document.id === targetId) continue;
        let parsed: TinaDocument;
        try {
          parsed = document.adapter.parse(
            await fs.readFile(document.realAbsolute, 'utf8'),
            candidate.bodyField
          );
        } catch (cause) {
          console.warn(
            `Cannot check "${document.id}" for references: it does not parse.`,
            cause
          );
          continue;
        }
        const references = collectReferences(
          parsed,
          candidate.schema.fields,
          options.collections
        );
        if (references.some((reference) => reference.path === targetId)) {
          const title = parsedTitleOf(parsed);
          found.push({
            collection: candidate.schema.name,
            path: document.id,
            ...(title === undefined ? {} : { title }),
          });
        }
      }
    }
    return found.sort((a, b) => (a.path < b.path ? -1 : 1));
  };

  const holdsForeignContent = async (
    collection: ResolvedCollection,
    realDirectory: string
  ): Promise<boolean> => {
    const folders = await ownerFolders();
    const realFolder = await realPathOf(collection.absoluteFolder);
    const hasCollectionBelow = folders.some(
      ({ candidate, realFolder: other }) =>
        candidate !== collection &&
        other.startsWith(realFolder + path.sep) &&
        (other === realDirectory || other.startsWith(realDirectory + path.sep))
    );
    if (hasCollectionBelow) return true;
    const dirents = await fs.readdir(realDirectory, {
      recursive: true,
      withFileTypes: true,
    });
    return dirents.some((dirent) => {
      if (dirent.isDirectory()) return false;
      if (SYSTEM_FILES.has(dirent.name)) return false;
      if (dirent.isSymbolicLink()) return true;
      const adapter = adapterForPath(collection.adapters, dirent.name);
      if (!adapter) return true;
      if (isPlaceholderName(dirent.name)) return false;
      return (
        ownerIn(folders, path.join(dirent.parentPath, dirent.name)) !==
        collection
      );
    });
  };

  const refuseForeignFolder = () =>
    refusal('folder-not-owned', REFUSAL_MESSAGES.folderNotOwned);

  const existingFolder = async (
    collection: ResolvedCollection,
    folder: string
  ) => {
    const checked = await checkedFolder(collection, folder);
    if (checked.parts.length === 0) {
      throw refusal('invalid-path', REFUSAL_MESSAGES.invalidName);
    }
    if (await isForeignDirectory(collection, checked.real)) {
      throw refuseForeignFolder();
    }
    if (!(await isDirectory(checked.real))) {
      throw refusal('not-found', 'That folder does not exist.');
    }
    return checked;
  };

  const documentsUnder = async (
    collection: ResolvedCollection,
    parts: string[]
  ): Promise<OwnedDocument[]> => {
    const scan = await scanCollection(collection);
    if (!scan) return [];
    const prefix = `${folderIdFor(collection, parts)}/`;
    return (await ownedDocuments(collection, scan)).filter((document) =>
      document.id.startsWith(prefix)
    );
  };

  const folderSummaryOf = (
    parts: string[],
    documentCount: number
  ): FolderSummary => ({
    path: parts.join('/'),
    name: parts.at(-1) ?? '',
    documentCount,
  });

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
        ...(await modifiedTimeOf(absolute)),
        document: adapter.parse(raw, collection.bodyField),
      };
    },

    async list(
      collectionName,
      query: ListQuery = {}
    ): Promise<DocumentConnection> {
      const collection = collectionFor(collectionName);
      const root = documentIdFor(collection.absoluteFolder);
      let scopeParts: string[] | undefined;
      if (query.folder !== undefined) {
        const checked = await checkedFolder(collection, query.folder);
        scopeParts = checked.parts;
        if (
          checked.parts.length > 0 &&
          (await isForeignDirectory(collection, checked.real))
        ) {
          throw refuseForeignFolder();
        }
      }
      const scan = await scanCollection(collection);
      if (!scan) {
        if (scopeParts && scopeParts.length > 0) {
          throw refusal('not-found', 'That folder does not exist.');
        }
        return queryDocuments({ summaries: [], root, query });
      }
      if (
        scopeParts &&
        scopeParts.length > 0 &&
        !scan.directories.includes(
          path.join(collection.absoluteFolder, ...scopeParts)
        )
      ) {
        throw refusal('not-found', 'That folder does not exist.');
      }
      const documents = await ownedDocuments(collection, scan);
      const inScope = (document: OwnedDocument): boolean => {
        if (!scopeParts) return true;
        const parts = path
          .relative(collection.absoluteFolder, path.dirname(document.absolute))
          .split(path.sep)
          .filter(Boolean);
        return (
          parts.length === scopeParts.length &&
          scopeParts.every((part, index) => parts[index] === part)
        );
      };
      const summaries = await Promise.all(
        documents.map((document) =>
          inScope(document)
            ? summarize(collection, document)
            : { path: document.id }
        )
      );
      const folders = await ownerFolders();
      const emptyFolders: string[] = [];
      for (const directory of scan.directories) {
        const relative = path
          .relative(collection.absoluteFolder, directory)
          .split(path.sep);
        if (relative.some((part) => part.startsWith('.'))) continue;
        if (
          await isForeignDirectory(
            collection,
            await realPathOf(directory),
            folders
          )
        ) {
          continue;
        }
        emptyFolders.push(relative.join('/'));
      }
      return queryDocuments({ summaries, root, emptyFolders, query });
    },

    async update(collectionName, documentPath, value, updateOptions) {
      const collection = collectionFor(collectionName);
      const target = await resolveOwnedPath(collection, documentPath);
      const { realAbsolute, adapter, canonicalPath } = target;
      const refusedWrite = (cause: unknown) =>
        new ContentWriteError(
          `Cannot save "${canonicalPath}": ${fileSystemReasonOf(cause)}.`
        );
      return lock.shared(() =>
        afterPendingSaves(realAbsolute, async () => {
          let previousRaw: string | undefined;
          try {
            previousRaw = await fs.readFile(realAbsolute, 'utf8');
          } catch (cause) {
            if (!isMissingFileError(cause)) throw refusedWrite(cause);
          }
          if (previousRaw === undefined) {
            // A save to a missing path is a create (ADR-019 §5).
            if (updateOptions?.mayCreate !== true) {
              throw forbid("You don't have permission to create documents.");
            }
            assertMayCreateDocument(collection);
            await assertNewFileAllowed(collection, target);
          }
          const raw = serializeFor(
            collection,
            adapter,
            canonicalPath,
            value,
            previousRaw
          );
          try {
            await fs.mkdir(path.dirname(realAbsolute), { recursive: true });
            await fs.writeFile(realAbsolute, raw);
          } catch (cause) {
            throw refusedWrite(cause);
          }
          await syncIndex({ changed: [canonicalPath] });
          return {
            path: canonicalPath,
            ...(await modifiedTimeOf(realAbsolute)),
            document: adapter.parse(raw, collection.bodyField),
          };
        })
      );
    },

    async create(collectionName, documentPath, value) {
      const collection = collectionFor(collectionName);
      assertMayCreateDocument(collection);
      const target = await checkedDocument(collection, documentPath);
      const { realAbsolute, adapter, canonicalPath } = target;
      return lock.exclusive(async () => {
        if (await exists(realAbsolute)) {
          throw refusal('name-taken', REFUSAL_MESSAGES.nameTaken);
        }
        await assertNewFileAllowed(collection, target);
        const raw = serializeFor(
          collection,
          adapter,
          canonicalPath,
          value,
          undefined
        );
        try {
          await fs.mkdir(path.dirname(realAbsolute), { recursive: true });
          await fs.writeFile(realAbsolute, raw, { flag: 'wx' });
        } catch (cause) {
          if (
            cause instanceof Error &&
            'code' in cause &&
            cause.code === 'EEXIST'
          ) {
            throw refusal('name-taken', REFUSAL_MESSAGES.nameTaken);
          }
          throw new ContentWriteError(
            `Cannot create "${canonicalPath}": ${fileSystemReasonOf(cause)}.`
          );
        }
        await syncIndex({ changed: [canonicalPath] });
        return {
          path: canonicalPath,
          ...(await modifiedTimeOf(realAbsolute)),
          document: adapter.parse(raw, collection.bodyField),
        };
      });
    },

    async rename(collectionName, from, to, renameOptions) {
      const collection = collectionFor(collectionName);
      const source = await checkedDocument(collection, from);
      const checkedTarget = await checkedDocument(collection, to);
      // On a case-insensitive file system the real path can come back in the
      // letter case of the existing file. The target keeps the case asked for.
      const targetName = path.basename(checkedTarget.absolute);
      const target = {
        ...checkedTarget,
        realAbsolute: path.join(
          path.dirname(checkedTarget.realAbsolute),
          targetName
        ),
        canonicalPath: path.posix.join(
          path.posix.dirname(checkedTarget.canonicalPath),
          targetName
        ),
      };
      if (
        path.dirname(source.canonicalPath) !==
          path.dirname(target.canonicalPath) ||
        path.extname(source.canonicalPath) !==
          path.extname(target.canonicalPath) ||
        !isValidFileName(
          path.basename(target.canonicalPath),
          target.adapter.extension
        )
      ) {
        throw refusal('invalid-path', REFUSAL_MESSAGES.invalidName);
      }
      return lock.exclusive(async (): Promise<RenameResult> => {
        if (!(await exists(source.realAbsolute))) {
          throw refusal('not-found', 'That document does not exist.');
        }
        if (await isTaken(source.realAbsolute, target.realAbsolute)) {
          throw refusal('name-taken', REFUSAL_MESSAGES.nameTaken);
        }
        const rewrites = await planRewrites(
          collection,
          new Map([[source.canonicalPath, target.canonicalPath]])
        );
        assertMaySaveReferrers(collection, rewrites, renameOptions);
        await applyMove(
          `rename "${source.canonicalPath}"`,
          { from: source.realAbsolute, to: target.realAbsolute },
          rewrites,
          (realAbsolute) =>
            realAbsolute === source.realAbsolute
              ? target.realAbsolute
              : realAbsolute
        );
        const referrers = rewrites.map(({ document }) =>
          document.realAbsolute === source.realAbsolute
            ? target.canonicalPath
            : document.id
        );
        await syncIndex({
          removed: [source.canonicalPath],
          changed: [target.canonicalPath, ...referrers],
        });
        return {
          entry: {
            path: target.canonicalPath,
            ...(await modifiedTimeOf(target.realAbsolute)),
          },
          referrers,
        };
      });
    },

    async delete(collectionName, documentPath) {
      const collection = collectionFor(collectionName);
      if (!allows(collection, 'canDelete')) {
        throw forbid(
          `Collection "${collection.schema.name}" does not allow deleting.`
        );
      }
      const target = await checkedDocument(collection, documentPath);
      await lock.exclusive(async () => {
        if (!(await exists(target.absolute))) {
          throw refusal('not-found', 'That document does not exist.');
        }
        try {
          await fs.unlink(target.absolute);
        } catch (cause) {
          throw new ContentWriteError(
            `Cannot delete "${target.canonicalPath}": ${fileSystemReasonOf(cause)}.`
          );
        }
        await syncIndex({ removed: [target.canonicalPath] });
      });
    },

    async referrers(collectionName, documentPath) {
      const collection = collectionFor(collectionName);
      const target = await checkedDocument(collection, documentPath);
      return referrersOf(collection, target.canonicalPath);
    },

    async createFolder(collectionName, folder) {
      const collection = collectionFor(collectionName);
      const checked = await checkedFolder(collection, folder);
      if (checked.parts.length === 0 || !checked.parts.every(isValidName)) {
        throw refusal('invalid-path', REFUSAL_MESSAGES.invalidName);
      }
      assertMayCreateFolder(collection, checked.parts.length);
      if (await isForeignDirectory(collection, checked.real)) {
        throw refuseForeignFolder();
      }
      return lock.exclusive(async () => {
        if (await exists(checked.real)) {
          throw refusal('name-taken', REFUSAL_MESSAGES.nameTaken);
        }
        const format = collectionFormats(collection.schema.format)[0];
        try {
          await fs.mkdir(checked.real, { recursive: true });
          await fs.writeFile(
            path.join(checked.real, `${PLACEHOLDER_PREFIX}${format}`),
            '',
            { flag: 'wx' }
          );
        } catch (cause) {
          throw new ContentWriteError(
            `Cannot create folder "${folder}": ${fileSystemReasonOf(cause)}.`
          );
        }
        return folderSummaryOf(checked.parts, 0);
      });
    },

    async renameFolder(collectionName, from, to, renameOptions) {
      const collection = collectionFor(collectionName);
      const source = await existingFolder(collection, from);
      const targetParts = folderPartsOf(to);
      if (
        !targetParts ||
        targetParts.length === 0 ||
        targetParts.length !== source.parts.length ||
        !targetParts
          .slice(0, -1)
          .every((part, index) => part === source.parts[index]) ||
        !isValidName(targetParts.at(-1) as string)
      ) {
        throw refusal('invalid-path', REFUSAL_MESSAGES.invalidName);
      }
      const checkedTarget = await checkedFolder(collection, to);
      const target = {
        ...checkedTarget,
        real: path.join(
          path.dirname(checkedTarget.real),
          targetParts.at(-1) as string
        ),
      };
      return lock.exclusive(async (): Promise<RenameFolderResult> => {
        if (await holdsForeignContent(collection, source.real)) {
          throw refuseForeignFolder();
        }
        if (await isTaken(source.real, target.real)) {
          throw refusal('name-taken', REFUSAL_MESSAGES.nameTaken);
        }
        const documents = await documentsUnder(collection, source.parts);
        const fromPrefix = `${folderIdFor(collection, source.parts)}/`;
        const toPrefix = `${folderIdFor(collection, targetParts)}/`;
        const moved = documents.map(({ id }) => ({
          from: id,
          to: toPrefix + id.slice(fromPrefix.length),
        }));
        const rewrites = await planRewrites(
          collection,
          new Map(moved.map(({ from: oldId, to: newId }) => [oldId, newId]))
        );
        assertMaySaveReferrers(collection, rewrites, renameOptions);
        const newIdOf = (id: string): string =>
          id.startsWith(fromPrefix)
            ? toPrefix + id.slice(fromPrefix.length)
            : id;
        await applyMove(
          `rename folder "${from}"`,
          { from: source.real, to: target.real },
          rewrites,
          (realAbsolute) =>
            realAbsolute.startsWith(source.real + path.sep)
              ? path.join(target.real, path.relative(source.real, realAbsolute))
              : realAbsolute
        );
        const referrers = rewrites.map(({ document }) => newIdOf(document.id));
        await syncIndex({
          removed: moved.map(({ from: oldId }) => oldId),
          changed: [...moved.map(({ to: newId }) => newId), ...referrers],
        });
        return {
          folder: folderSummaryOf(targetParts, documents.length),
          moved,
          referrers,
        };
      });
    },

    async deleteFolder(collectionName, folder) {
      const collection = collectionFor(collectionName);
      if (!allows(collection, 'canDelete')) {
        throw forbid(
          `Collection "${collection.schema.name}" does not allow deleting.`
        );
      }
      const source = await existingFolder(collection, folder);
      return lock.exclusive(async () => {
        if (await holdsForeignContent(collection, source.real)) {
          throw refuseForeignFolder();
        }
        const documents = await documentsUnder(collection, source.parts);
        const aside = path.join(
          path.dirname(source.real),
          `.${path.basename(source.real)}.deleting-${randomUUID()}`
        );
        try {
          await fs.rename(source.real, aside);
        } catch (cause) {
          throw failedStructuralWrite(`delete folder "${folder}"`, cause, []);
        }
        try {
          await fs.rm(aside, { recursive: true, force: true });
        } catch (cause) {
          const stuck = await rollBack([
            {
              label: folder,
              restore: () => fs.rename(aside, source.real),
            },
          ]);
          const gone: string[] = [];
          for (const document of documents) {
            if (!(await exists(document.absolute))) gone.push(document.id);
          }
          await syncIndex({ removed: gone });
          const base = `Cannot delete folder "${folder}": ${fileSystemReasonOf(cause)}. Some of its files may have been removed`;
          throw new ContentWriteError(
            stuck.length === 0
              ? `${base}.`
              : `${base}, and the rest could not be put back under its name: look for "${path.basename(aside)}" next to it.`
          );
        }
        const deleted = documents.map(({ id }) => id);
        await syncIndex({ removed: deleted });
        return { deleted };
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
