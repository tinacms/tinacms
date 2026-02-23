import { useEffect } from 'react'
import type { FormApi } from 'final-form'

// Global set to track all dirty forms by their ID
// This persists across component remounts
const dirtyForms = new Set<string>()

/**
 * Registers a form with the unsaved changes tracker.
 * Call this from FormBuilder to track dirty state globally.
 */
export function useTrackFormDirtyState(formId: string, finalForm: FormApi) {
  useEffect(() => {
    const unsubscribe = finalForm.subscribe(
      ({ pristine }) => {
        if (pristine) {
          dirtyForms.delete(formId)
        } else {
          dirtyForms.add(formId)
        }
      },
      { pristine: true }
    )

    return () => {
      unsubscribe()
      // Clean up when form unmounts
      dirtyForms.delete(formId)
    }
  }, [formId, finalForm])
}

/**
 * Hook to warn users about unsaved changes when navigating away.
 * Uses a global tracker that persists across component remounts.
 *
 * Handles browser refresh, close tab, and external navigation via the
 * beforeunload event.
 */
export function useUnsavedChangesWarning() {
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      // Check if any forms are dirty
      if (dirtyForms.size > 0) {
        event.preventDefault()
        event.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [])
}

/**
 * Check if there are any unsaved changes across all forms.
 * Can be used for UI indicators.
 */
export function hasUnsavedChanges(): boolean {
  return dirtyForms.size > 0
}
