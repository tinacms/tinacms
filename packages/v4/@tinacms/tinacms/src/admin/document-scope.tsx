// Owns the open document's form scope, and sits ABOVE the whole layout rather than
// around the field list.
//
// The preview is the reason. It streams the open form's values across the iframe
// boundary, so it reads the same scope the fields write to — and it renders in the
// main pane, not the sidebar. Scoping the form to the sidebar put the preview outside
// it, which is a runtime throw with no type to catch it. Anything else the shell grows
// that reads the open document (a toolbar, a document-actions menu) lands the same way.

import { type ReactNode, useMemo } from 'react';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { useCollectionDocuments, useContentSlice } from '../editor/hooks';
import { FormProvider } from '../editor/provider';

export interface DocumentScopeProps {
  collection: CollectionSchema;
  path: string;
  children: ReactNode;
}

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

  // The persisted entry is dropped on purpose — saveDocument feeds it back into the
  // slice's list cache, so it arrives here through the same read as everything else
  // rather than as a second seed racing it.
  const save = async (value: TinaDocument) => {
    await content.saveDocument(collection.name, path, value);
  };

  // Still loading, or a path that is not in the collection: the layout renders either
  // way, minus the parts that need a form.
  if (!entry) return children;

  return (
    // Keyed on the path: switching documents tears the scope down and hosts the other
    // one. The store keeps the outgoing form's unsaved edits (ADR-012), so switching
    // away and back returns to them rather than to the file.
    <FormProvider
      key={path}
      collection={collection}
      path={path}
      document={entry.document}
      onSave={save}
    >
      {children}
    </FormProvider>
  );
}
