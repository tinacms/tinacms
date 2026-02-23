import { useEffect, useRef } from 'react'
import { useCMS } from '@toolkit/react-core'

/**
 * Hook to warn users about unsaved changes when navigating away.
 *
 * Handles browser refresh, close tab, and external navigation via the
 * beforeunload event. When ANY form in the CMS has unsaved changes,
 * the browser will show a native confirmation dialog.
 *
 * This hook checks all registered forms in the CMS at the moment of
 * navigation, ensuring accurate state even after drilling into nested
 * fields (which may cause individual form state tracking to become
 * out of sync).
 *
 * Note: Modern browsers show a generic message for security reasons,
 * custom messages are not supported.
 */
export function useUnsavedChangesWarning() {
  const cms = useCMS()
  const cmsRef = useRef(cms)

  // Keep ref in sync
  useEffect(() => {
    cmsRef.current = cms
  }, [cms])

  // Handle beforeunload (browser refresh, close tab, external navigation)
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      // Check ALL forms in the CMS to see if any are dirty
      const forms = cmsRef.current?.state?.forms || []
      const hasUnsavedChanges = forms.some(({ tinaForm }) => {
        const formState = tinaForm?.finalForm?.getState()
        return formState && !formState.pristine
      })

      if (hasUnsavedChanges) {
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
