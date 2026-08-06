import { type ReactNode, useEffect, useRef } from 'react';
import type { DocumentEntry } from '../core/content/contract';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import {
  useCollectionDocuments,
  useSaveDocument,
} from '../editor/content-queries';
import { FormProvider } from '../editor/provider';

export interface DocumentScopeProps {
  collection?: CollectionSchema;
  path?: string;
  children: ReactNode;
}

const usePinnedDocument = (
  path: string | undefined,
  cached: DocumentEntry | undefined
): DocumentEntry | undefined => {
  const pinned = useRef<{ path: string; entry: DocumentEntry } | null>(null);
  if (pinned.current?.path !== path) {
    pinned.current = path && cached ? { path, entry: cached } : null;
  }
  return pinned.current?.entry;
};

export function DocumentScope({
  collection,
  path,
  children,
}: DocumentScopeProps) {
  const { documents } = useCollectionDocuments(collection?.name);
  const cached = documents.find((candidate) => candidate.path === path);
  const entry = usePinnedDocument(path, cached);

  const { save: saveDocument } = useSaveDocument();
  const openDocument = (): { collection: string; path: string } | null =>
    collection && path ? { collection: collection.name, path } : null;
  const saveRef = useRef({ target: openDocument(), saveDocument });
  useEffect(() => {
    saveRef.current = { target: openDocument(), saveDocument };
  });
  const save = useRef(async (value: TinaDocument) => {
    const { target, saveDocument: latestSave } = saveRef.current;
    if (!target) return;
    await latestSave({ ...target, value });
  }).current;

  if (!(collection && path)) return children;

  if (!entry) return children;

  return (
    <FormProvider
      collection={collection}
      path={path}
      document={entry.document}
      onSave={save}
    >
      {children}
    </FormProvider>
  );
}
