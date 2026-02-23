import { useEffect, useRef } from 'react'
import type { FormApi } from 'final-form'

// Global set to track forms that have unsaved changes
// Forms are added when they become dirty, and only removed on successful submit
const dirtyForms = new Set<string>()

/**
 * Registers a form with the unsaved changes tracker.
 * Tracks when a form becomes dirty and clears on successful submit.
 */
export function useTrackFormDirtyState(
  formId: string,
  finalForm: FormApi,
  onSubmit?: () => void
) {
  const initialValuesRef = useRef<string | null>(null)

  useEffect(() => {
    // Capture initial values as JSON for comparison
    const state = finalForm.getState()
    initialValuesRef.current = JSON.stringify(state.initialValues)

    const unsubscribe = finalForm.subscribe(
      ({ values, submitting, submitSucceeded }) => {
        // If form was just successfully submitted, clear dirty state
        if (submitSucceeded && !submitting) {
          dirtyForms.delete(formId)
          // Update initial values reference after successful save
          initialValuesRef.current = JSON.stringify(values)
          return
        }

        // Compare current values to initial values
        const currentValues = JSON.stringify(values)
        const hasChanges = currentValues !== initialValuesRef.current

        if (hasChanges) {
          dirtyForms.add(formId)
        }
      },
      { values: true, submitting: true, submitSucceeded: true }
    )

    return () => {
      unsubscribe()
      // Don't clear on unmount - form might remount
    }
  }, [formId, finalForm])
}

/**
 * Hook to warn users about unsaved changes when navigating away.
 */
export function useUnsavedChangesWarning() {
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
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
 * Clear dirty state for a specific form (call after successful save)
 */
export function clearFormDirtyState(formId: string) {
  dirtyForms.delete(formId)
}

/**
 * Clear all dirty state (e.g., when navigating away intentionally)
 */
export function clearAllDirtyState() {
  dirtyForms.clear()
}

/**
 * Check if there are any unsaved changes
 */
export function hasUnsavedChanges(): boolean {
  return dirtyForms.size > 0
}
