// This owns the form scope of the open document. It sits above the whole layout, and not
// around the field list.
//
// The preview is the reason. It streams the open form's values across the iframe
// boundary, so it reads the same scope the fields write to — and it renders in the
// main pane, not the sidebar. Scoping the form to the sidebar put the preview outside
// it, which is a runtime throw with no type to catch it. Anything else the shell grows
// that reads the open document (a toolbar, a document-actions menu) lands the same way.
//
// With nothing open, or with the entry still loading, it renders `children` bare. That
// swap changes the element type at this position, so React unmounts and rebuilds what
// sits below — the two document panes, including the preview iframe. It is confined to
// those panes on purpose: the sidebar and its document list sit above this scope and
// keep their open state, their fetch, and their scroll position across a switch.

import { type ReactNode, useEffect, useRef } from 'react';
import type { DocumentEntry } from '../core/content/contract';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import {
  useCollectionDocuments,
  useSaveDocument,
} from '../editor/content-queries';
import { FormProvider } from '../editor/provider';

export interface DocumentScopeProps {
  // Both absent when no document is open. The component still renders, so the panes
  // below keep their place in the tree.
  collection?: CollectionSchema;
  path?: string;
  children: ReactNode;
}

/**
 * The document the form seeds from, pinned for as long as `path` is open.
 *
 * A save writes the stored entry back into the list cache. The cache has to keep the
 * list badges current, and must not seed the mounted form again — a new `document` prop
 * ingests again and resets RHF, dropping the clean baseline the save just set and any
 * key typed while it was in flight.
 *
 * A ref, not useMemo. useMemo is a cache React is allowed to discard, and a discarded
 * one returns the post-save entry: the exact re-seed this exists to prevent, arriving
 * unpredictably rather than never.
 */
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
  // This reads the list that the sidebar renders, and shares its request — it does not
  // fetch again. Two reads of one document can disagree, and the form would then seed
  // from the older one.
  const { documents } = useCollectionDocuments(collection?.name);
  const cached = documents.find((candidate) => candidate.path === path);
  const entry = usePinnedDocument(path, cached);

  // The save handler is stable, so FormProvider's formScope memo holds. Rebuilt each
  // render it changed on every content-slice update, which defeated the memo and the
  // "changes only on a document switch" contract in editor/context.ts.
  const { save: saveDocument } = useSaveDocument();
  // The open document travels as one value, because only a collection and a path
  // together name one. Either alone is not half a document, it is no document.
  const openDocument = (): { collection: string; path: string } | null =>
    collection && path ? { collection: collection.name, path } : null;
  const saveRef = useRef({ target: openDocument(), saveDocument });
  // Written after the commit, and not during the render. `save` is permanently stable
  // and reads this when the author invokes it, which is always after a commit — so a
  // render React starts and then throws away must not leave this pointing at that
  // render's document.
  useEffect(() => {
    saveRef.current = { target: openDocument(), saveDocument };
  });
  const save = useRef(async (value: TinaDocument) => {
    const { target, saveDocument: latestSave } = saveRef.current;
    if (!target) return;
    await latestSave({ ...target, value });
  }).current;

  // Nothing open: no form scope to provide, so the panes render without one and read
  // that absence through FormScopeContext.
  if (!(collection && path)) return children;

  // Wait for the document. Mounting the provider without one seeds the form empty, and
  // Plate reads its value at mount only — so the editor stayed blank once the entry
  // arrived. The panes below therefore mount once, with a value.
  if (!entry) return children;

  return (
    // No key, and that is the point. The provider hosts a switch of document in place:
    // it resets RHF to the next document's seed and advances the seed key, which is
    // what a field hosting its own editor remounts on. The continuity tests pin that
    // down under "unkeyed document switches". A key here remounted everything below on
    // every switch — including the preview iframe, whose same-origin reload runs on the
    // admin's own main thread and froze the whole shell while the preview re-booted.
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
