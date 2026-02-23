import { useEffect, useRef } from 'react'
import type { FormApi } from 'final-form'

interface UnsavedChangesWarningProps {
  finalForm: FormApi
}

/**
 * Hook to warn users about unsaved changes when navigating away.
 *
 * Handles browser refresh, close tab, and external navigation via the
 * beforeunload event. When the user has unsaved changes (form is dirty),
 * the browser will show a native confirmation dialog.
 *
 * This hook checks the form's dirty state directly from finalForm at the
 * moment of navigation, ensuring accurate state even after drilling into
 * nested fields.
 *
 * Note: Modern browsers show a generic message for security reasons,
 * custom messages are not supported.
 *
 * @param finalForm - The final-form FormApi instance to check for dirty state
 */
export function useUnsavedChangesWarning({
  finalForm,
}: UnsavedChangesWarningProps) {
  const finalFormRef = useRef(finalForm)

  // Keep ref in sync with prop
  useEffect(() => {
    finalFormRef.current = finalForm
  }, [finalForm])

  // Handle beforeunload (browser refresh, close tab, external navigation)
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      // Check the actual form state at the moment of navigation
      const formState = finalFormRef.current?.getState()
      const isDirty = formState && !formState.pristine

      if (isDirty) {
        event.preventDefault()
        // Modern browsers ignore custom messages, but we still need to set returnValue
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
