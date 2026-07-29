// This owns the form scope of the open document. It sits above the whole layout, and not
// around the field list.
//
// The preview is the reason. It streams the open form's values across the iframe
// boundary, so it reads the same scope the fields write to — and it renders in the
// main pane, not the sidebar. Scoping the form to the sidebar put the preview outside
// it, which is a runtime throw with no type to catch it. Anything else the shell grows
// that reads the open document (a toolbar, a document-actions menu) lands the same way.

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
  const content = useContentSlice();
  // From the same list the sidebar renders, not a second fetch: two reads of one
  // document can disagree, and the form would seed from the loser.
  const cached = useCollectionDocuments(collection.name).find(
    (candidate) => candidate.path === path
  );
  // Pinned for the life of this scope. A save feeds the persisted entry back into
  // that cache, which has to keep the list badges fresh WITHOUT re-seeding the
  // mounted form: a fresh `document` prop re-ingests and resets RHF, dropping both
  // the saved-clean baseline and any keystroke typed while the save was in flight.
  // Switching documents remounts on the `key` below, so the pin never goes stale.
  const entry = useMemo(() => cached, [cached?.path]);

  // Nothing open: no form scope to provide, so the panes render without one and read
  // that absence through FormScopeContext.
  if (!(collection && path)) return children;

  // Wait for the document. Mounting the provider without one seeds the form empty, and
  // Plate reads its value at mount only — so the editor stayed blank once the entry
  // arrived. The panes below therefore mount once, with a value.
  //
  // This is the swap the shell used to do around the whole layout. Here it is confined
  // to the two panes that hold the document, which are created with it in any case; the
  // sidebar sits above this and keeps its state.
  if (!entry) return children;

  return (
    // Keyed on the path, and it has to be. FormProvider does re-seed when its formId
    // changes, but the reset lands in an effect — after the children have rendered — so
    // Plate, which reads its value at mount only, keeps the previous document's prose.
    // A fresh RHF instance means the fields mount with the right values to begin with.
    //
    // The cost is that these children remount per document, so the preview iframe
    // reloads on a switch. That is why this scope wraps the two panes and not the whole
    // shell: the sidebar and its document list sit above it and survive.
    <FormProvider
      key={path}
      collection={collection}
      path={path}
      document={entry?.document}
      onSave={save}
    >
      {children}
    </FormProvider>
  );
}
