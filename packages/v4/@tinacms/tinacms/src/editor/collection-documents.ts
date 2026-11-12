import {
  type QueryClient,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { use, useMemo } from 'react';
import type { AuthSlice } from '../core/auth/contract';
import { defaultRolesGrant } from '../core/auth/default-roles';
import {
  CONTENT_CREATE_PERMISSION,
  CONTENT_DELETE_PERMISSION,
  CONTENT_RENAME_PERMISSION,
  ContentError,
  type ContentProvider,
  type DocumentConnection,
  type DocumentReferrer,
  type FolderSummary,
  type ListQuery,
  type RenameFolderResult,
  type RenameResult,
} from '../core/content/contract';
import { ingestDocument } from '../core/form/ingest';
import { invariant } from '../core/invariant';
import type { CollectionSchema } from '../core/schema/types';
import { listStoredDraftIds, readDraft } from '../form/drafts';
import {
  type FormId,
  readFormStore,
  toFormId,
  useNewDocumentIds,
  useUnsavedFormIds,
} from '../form/form-store';
import { TinaRuntimeContext } from './context';
import {
  contentKeys,
  CONTENT_STALE_TIME,
  PAGE_KEY_PART,
  useCurrentBranch,
} from './content-queries';
import { useContentSlice, useOptionalAuthSlice } from './hooks';

const NAME_MAX_BYTES = 255;

const hasControlCharacter = (name: string): boolean =>
  [...name].some((char) => {
    const code = char.charCodeAt(0);
    return code < 0x20 || code === 0x7f;
  });

/** The server's name rules, checked early so a dialog can answer without a round trip. */
export const isValidName = (name: string): boolean =>
  new TextEncoder().encode(name).length >= 1 &&
  new TextEncoder().encode(name).length <= NAME_MAX_BYTES &&
  !name.includes('/') &&
  !name.includes('\\') &&
  !hasControlCharacter(name) &&
  name !== '.' &&
  name !== '..' &&
  !name.startsWith('.') &&
  !name.endsWith(' ') &&
  !name.endsWith('.') &&
  name.trim() !== '';

/** A file name is valid when the name and the name without its extension are. */
export const isValidFileName = (name: string, extension: string): boolean =>
  isValidName(name) &&
  isValidName(name.slice(0, name.length - extension.length));

const parentOf = (path: string): string =>
  path.split('/').slice(0, -1).join('/');
const nameOf = (path: string): string => path.split('/').at(-1) ?? path;
const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return dot <= 0 ? '' : name.slice(dot);
};

const trimSlashes = (path: string): string => path.replace(/^\/+|\/+$/g, '');

/** The repo-relative directory of a folder of the collection. */
export const directoryOf = (
  collection: CollectionSchema,
  folder: string
): string =>
  [trimSlashes(collection.path ?? ''), trimSlashes(folder)]
    .filter((part) => part !== '')
    .join('/');

/** The folder path form of the folder that holds a document. `''` is the collection's top level. */
export const folderOfDocument = (
  collection: CollectionSchema,
  documentPath: string
): string => {
  const root = directoryOf(collection, '');
  const parent = parentOf(documentPath);
  if (!isUnder(parent, root) || parent === root) return '';
  return parent.slice(root.length === 0 ? 0 : root.length + 1);
};

export const isUnder = (path: string, directory: string): boolean =>
  directory === '' || path.startsWith(`${directory}/`);

const toContentError = (cause: unknown): ContentError => {
  if (cause instanceof ContentError) return cause;
  if (cause instanceof TypeError)
    return new ContentError('network', cause.message);
  if (cause instanceof Error) {
    return new ContentError('backend-failure', cause.message);
  }
  return new ContentError('backend-failure', String(cause));
};

const attempt = async <Result>(run: () => Promise<Result>): Promise<Result> => {
  try {
    return await run();
  } catch (cause) {
    throw toContentError(cause);
  }
};

/** One table page of a collection. The key sits under the collection's list key. */
export const documentsPageKey = (
  collection: string,
  query: ListQuery,
  branch?: string
) => [
  ...contentKeys.list(collection, branch),
  PAGE_KEY_PART,
  query.folder ?? '',
  query.filter ?? '',
  query.sort?.by ?? '',
  query.sort?.direction ?? '',
  query.after ?? '',
];

export const useDocumentsPage = (collection: string, query: ListQuery) => {
  const content = useContentSlice();
  const branch = useCurrentBranch();
  return useQuery<DocumentConnection>({
    queryKey: documentsPageKey(collection, query, branch),
    queryFn: () => attempt(() => content.list(collection, query)),
    staleTime: CONTENT_STALE_TIME,
  });
};

const userMay = (auth: AuthSlice | null, permission: string): boolean => {
  if (!auth) return true;
  if (auth.status !== 'signed-in') return false;
  return defaultRolesGrant(auth.roles, permission);
};

export interface CollectionCapabilities {
  canCreateFolder: boolean;
  /** The collection's switch only. New > Document stays disabled until its own change. */
  canCreateDocument: boolean;
  canRename: boolean;
  canDuplicate: boolean;
  canDelete: boolean;
}

const useCollectionSchema = (name: string): CollectionSchema | undefined => {
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'collection-documents-outside-provider',
    'Collection hooks must be used within a TinaProvider'
  );
  return runtime.schema.collections.find(
    (candidate) => candidate.name === name
  );
};

/**
 * What the signed-in user may do in a collection. The result is false when the
 * provider lacks the operation, the default roles lack the permission, or the
 * collection's `allowedActions` switch is off. The server stays the boundary.
 */
export const useCollectionCapabilities = (
  collection: string,
  folder: string
): CollectionCapabilities => {
  const content: ContentProvider = useContentSlice();
  const auth = useOptionalAuthSlice();
  const switches = useCollectionSchema(collection)?.allowedActions;
  const may = (permission: string) => userMay(auth, permission);
  return {
    canCreateFolder:
      content.createFolder !== undefined &&
      may(CONTENT_CREATE_PERMISSION) &&
      switches?.canCreateFolder !== false &&
      (folder === '' || switches?.canCreateNestedFolder !== false),
    canCreateDocument: switches?.canCreate !== false,
    canRename: content.rename !== undefined && may(CONTENT_RENAME_PERMISSION),
    canDuplicate:
      content.create !== undefined &&
      may(CONTENT_CREATE_PERMISSION) &&
      switches?.canDuplicate !== false,
    canDelete:
      content.delete !== undefined &&
      may(CONTENT_DELETE_PERMISSION) &&
      switches?.canDelete !== false,
  };
};

/** The unsaved documents of the collection that hold no file yet and sit directly in `folder`. */
export const useNewDocumentDrafts = (
  collection: string,
  folder: string
): { path: string }[] => {
  const schema = useCollectionSchema(collection);
  const ids = useNewDocumentIds();
  return useMemo(() => {
    if (!schema) return [];
    const directory = directoryOf(schema, folder);
    return ids
      .filter((id) => parentOf(id) === directory)
      .map((id) => ({ path: id }));
  }, [schema, folder, ids]);
};

export interface DraftCounts {
  /** How many of the paths hold unsaved edits. */
  documentsWithDraft: (paths: string[]) => number;
  /** How many unsaved copies sit anywhere under the folder. */
  newDraftsUnder: (folder: string) => number;
  /** How many documents hold unsaved edits anywhere under the folder, unsaved copies included. */
  draftsUnder: (folder: string) => number;
}

export const useDraftCounts = (collection: string): DraftCounts => {
  const schema = useCollectionSchema(collection);
  const unsaved = useUnsavedFormIds();
  const created = useNewDocumentIds();
  return useMemo(() => {
    const under = (ids: readonly FormId[], folder: string) =>
      schema
        ? ids.filter((id) => isUnder(id, directoryOf(schema, folder))).length
        : 0;
    return {
      documentsWithDraft: (paths) =>
        paths.filter((path) => unsaved.includes(toFormId(path))).length,
      newDraftsUnder: (folder) => under(created, folder),
      draftsUnder: (folder) => under(unsaved, folder),
    };
  }, [schema, unsaved, created]);
};

export interface CollectionActions {
  renameDocument(from: string, to: string): Promise<RenameResult>;
  deleteDocument(path: string): Promise<void>;
  referrersOf(path: string): Promise<DocumentReferrer[]>;
  createFolder(folder: string): Promise<FolderSummary>;
  renameFolder(from: string, to: string): Promise<RenameFolderResult>;
  deleteFolder(folder: string): Promise<{ deleted: string[] }>;
  /**
   * Stores a new-document draft at `to`, seeded with the saved values of `from`.
   * Nothing is written to the provider. The caller opens the document route.
   */
  duplicateDocument(from: string, to: string): Promise<void>;
}

const invalidateCollection = (
  queryClient: QueryClient,
  collection: string,
  branch: string | undefined,
  touched: readonly string[],
  otherCollectionsChanged: boolean
) => {
  const touchedPaths = new Set(touched);
  const listPrefix = contentKeys.list(collection, branch);
  void queryClient.invalidateQueries({ queryKey: listPrefix });
  void queryClient.invalidateQueries({
    predicate: ({ queryKey }) => {
      const [scope, kind, type, , path, queryBranch] = queryKey;
      if (scope !== 'tina' || kind !== 'content') return false;
      if (type === 'document') {
        return (
          typeof path === 'string' &&
          touchedPaths.has(path) &&
          queryBranch === (branch ?? '')
        );
      }
      return (
        otherCollectionsChanged &&
        type === 'list' &&
        queryBranch === (branch ?? '')
      );
    },
  });
};

const requireOperation = <Operation>(
  operation: Operation | undefined
): Operation => {
  if (operation === undefined) throw new ContentError('forbidden');
  return operation;
};

const draftIdsUnder = (directory: string): FormId[] => {
  const { userId, branch } = readFormStore();
  return listStoredDraftIds(userId, branch).filter((id) =>
    isUnder(id, directory)
  );
};

const newDraftIdsUnder = (directory: string): FormId[] => {
  const { userId, branch, forms } = readFormStore();
  const open = (Object.keys(forms) as FormId[]).filter((id) => {
    const scope = forms[id];
    return scope?.status === 'edited' && scope.isNew === true;
  });
  const stored = draftIdsUnder(directory).filter(
    (id) => readDraft(id, userId, branch)?.new === true
  );
  return [...new Set([...open, ...stored])].filter((id) =>
    isUnder(id, directory)
  );
};

export const useCollectionActions = (collection: string): CollectionActions => {
  const content: ContentProvider = useContentSlice();
  const runtime = use(TinaRuntimeContext);
  invariant(
    runtime,
    'collection-actions-outside-provider',
    'useCollectionActions must be used within a TinaProvider'
  );
  const schema = useCollectionSchema(collection);
  const queryClient = useQueryClient();
  const branch = useCurrentBranch();

  const invalidate = (touched: readonly string[], rewrote: boolean) =>
    invalidateCollection(queryClient, collection, branch, touched, rewrote);

  return {
    renameDocument: (from, to) =>
      attempt(async () => {
        const result = await requireOperation(content.rename)(
          collection,
          from,
          to
        );
        readFormStore().moveForm(toFormId(from), toFormId(to));
        invalidate(
          [from, to, ...result.referrers],
          result.referrers.length > 0
        );
        return result;
      }),

    deleteDocument: (path) =>
      attempt(async () => {
        await requireOperation(content.delete)(collection, path);
        readFormStore().discardStoredDraft(toFormId(path));
        invalidate([path], false);
      }),

    referrersOf: (path) =>
      attempt(() => requireOperation(content.referrers)(collection, path)),

    createFolder: (folder) =>
      attempt(async () => {
        const created = await requireOperation(content.createFolder)(
          collection,
          folder
        );
        invalidate([], false);
        return created;
      }),

    renameFolder: (from, to) =>
      attempt(async () => {
        const result = await requireOperation(content.renameFolder)(
          collection,
          from,
          to
        );
        const store = readFormStore();
        const fromDirectory = schema ? directoryOf(schema, from) : from;
        const toDirectory = schema ? directoryOf(schema, to) : to;
        const copies = newDraftIdsUnder(fromDirectory).map((path) => ({
          from: path,
          to: `${toDirectory}${path.slice(fromDirectory.length)}`,
        }));
        const pairs = [...result.moved, ...copies];
        for (const pair of pairs) {
          store.moveForm(toFormId(pair.from), toFormId(pair.to));
        }
        invalidate(
          [
            ...pairs.flatMap((pair) => [pair.from, pair.to]),
            ...result.referrers,
          ],
          result.referrers.length > 0
        );
        return result;
      }),

    deleteFolder: (folder) =>
      attempt(async () => {
        const result = await requireOperation(content.deleteFolder)(
          collection,
          folder
        );
        const directory = schema ? directoryOf(schema, folder) : folder;
        const gone = new Set<string>([
          ...result.deleted,
          ...newDraftIdsUnder(directory),
        ]);
        for (const path of gone) {
          readFormStore().discardStoredDraft(toFormId(path));
        }
        invalidate([...gone], false);
        return result;
      }),

    duplicateDocument: (from, to) =>
      attempt(async () => {
        requireOperation(content.create);
        if (
          !isValidFileName(nameOf(to), extensionOf(nameOf(from))) ||
          parentOf(to) !== parentOf(from) ||
          extensionOf(nameOf(to)) !== extensionOf(nameOf(from))
        ) {
          throw new ContentError('invalid-path');
        }
        if ((await content.get(collection, to)) !== null || holdsNewDraft(to)) {
          throw new ContentError('name-taken');
        }
        const original = await content.get(collection, from);
        if (!original || !schema) throw new ContentError('not-found');
        const values = ingestDocument(original.document, schema.fields, {
          documentPath: to,
          registry: runtime.registry,
        });
        const stored = readFormStore().storeNewDocumentDraft(
          toFormId(to),
          values
        );
        if (stored !== 'ok') {
          throw new ContentError(
            'backend-failure',
            'This browser cannot keep the copy.'
          );
        }
      }),
  };
};

const holdsNewDraft = (path: string): boolean => {
  const { userId, branch, forms } = readFormStore();
  const id = toFormId(path);
  const open = forms[id];
  if (open?.status === 'edited' && open.isNew) return true;
  return readDraft(id, userId, branch)?.new === true;
};
