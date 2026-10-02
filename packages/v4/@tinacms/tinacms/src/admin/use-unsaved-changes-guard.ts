import { useEffect } from 'react';
import { formStatus, useFormStore } from '../form/form-store';

// The form store holds unsaved edits in memory, and a reload discards them. The guard
// reads every open form, not the open document alone: the sidebar keeps the "Unsaved"
// badge on a document after the editor moves to a different one.
export function useUnsavedChangesGuard(): void {
  const hasUnsavedEdits = useFormStore((state) =>
    Object.values(state.forms).some((scope) => formStatus(scope) === 'dirty')
  );
  useEffect(() => {
    if (!hasUnsavedEdits) return;
    const blockReload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', blockReload);
    return () => window.removeEventListener('beforeunload', blockReload);
  }, [hasUnsavedEdits]);
}
