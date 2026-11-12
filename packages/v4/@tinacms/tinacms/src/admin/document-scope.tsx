import { type ReactNode, use, useEffect, useRef, useState } from 'react';
import type { DocumentEntry } from '../core/content/contract';
import { fieldEqualityFor } from '../core/form/compare';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { useDocument, useSaveDocument } from '../editor/content-queries';
import { TinaRuntimeContext } from '../editor/context';
import { FormProvider } from '../editor/provider';
import { readDraft } from '../form/drafts';
import {
  formStatus,
  readFormStore,
  toFormId,
  toFormValues,
  useFormStore,
  useHasNewDocument,
} from '../form/form-store';

export interface DocumentScopeProps {
  collection?: CollectionSchema;
  path?: string;
  /** Where Discard goes for a document that has no file yet. */
  onDiscardNew?: () => void;
  children: ReactNode;
}

// A pinned entry holds the form on one document while the document query
// refetches. A refetch that brings newer content must reach the form, or a save
// writes the stale values back over the file. A dirty form keeps its pin: the
// edits of the user come first.
const usePinnedDocument = (
  path: string | undefined,
  cached: DocumentEntry | undefined
): DocumentEntry | undefined => {
  const dirty = useFormStore((state) =>
    path ? formStatus(state.forms[toFormId(path)]) === 'dirty' : false
  );
  const pinned = useRef<{ path: string; entry: DocumentEntry } | null>(null);
  const newerContent =
    !dirty && cached !== undefined && pinned.current?.entry !== cached;
  if (pinned.current?.path !== path || newerContent) {
    pinned.current = path && cached ? { path, entry: cached } : null;
  }
  return pinned.current?.entry;
};

export function DocumentScope({
  collection,
  path,
  onDiscardNew,
  children,
}: DocumentScopeProps) {
  const runtime = use(TinaRuntimeContext);
  const { entry: loaded, isLoading } = useDocument(collection?.name, path);
  const entry = usePinnedDocument(path, loaded ?? undefined);
  const holdsNewDocument = useHasNewDocument(
    collection && path ? toFormId(path) : undefined
  );
  const isNew = !isLoading && loaded === null && holdsNewDocument;

  // A document with no file opens on its stored copy, with an empty baseline, so it reads as unsaved.
  const [seededPath, setSeededPath] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!holdsNewDocument) {
      setSeededPath(undefined);
      return;
    }
    if (!(collection && path && runtime && isNew)) return;
    const formId = toFormId(path);
    const { userId, branch } = readFormStore();
    const stored = readDraft(formId, userId, branch);
    if (stored?.new) {
      readFormStore().seedNewDocument(
        formId,
        toFormValues(stored.values),
        fieldEqualityFor(collection.fields, {
          documentPath: path,
          registry: runtime.registry,
        })
      );
    }
    setSeededPath(path);
  }, [collection, path, runtime, isNew, holdsNewDocument]);

  const { save: saveDocument } = useSaveDocument();
  const openDocument = (): {
    collection: string;
    path: string;
    isNew: boolean;
  } | null =>
    collection && path ? { collection: collection.name, path, isNew } : null;
  const saveRef = useRef({ target: openDocument(), saveDocument });
  useEffect(() => {
    saveRef.current = { target: openDocument(), saveDocument };
  });
  const save = useRef(async (value: TinaDocument) => {
    const { target, saveDocument: latestSave } = saveRef.current;
    if (!target) return;
    return latestSave({ ...target, value });
  }).current;

  if (!(collection && path)) return children;

  const opensNewDocument = holdsNewDocument && seededPath === path;
  if (!entry && !opensNewDocument) return children;

  return (
    <FormProvider
      collection={collection}
      path={path}
      document={entry?.document}
      onSave={save}
      onDiscardNew={isNew ? onDiscardNew : undefined}
    >
      {children}
    </FormProvider>
  );
}
