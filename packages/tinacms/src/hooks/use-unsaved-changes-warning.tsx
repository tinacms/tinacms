import * as React from 'react'
import { useEffect, useRef } from 'react'

interface UnsavedChangesWarningProps {
  isBlocking: boolean
}

/**
 * Hook to warn users about unsaved changes when navigating away.
 *
 * Handles browser refresh, close tab, and external navigation via the
 * beforeunload event. When the user has unsaved changes (isBlocking=true),
 * the browser will show a native confirmation dialog.
 *
 * Note: Modern browsers show a generic message for security reasons,
 * custom messages are not supported.
 *
 * @param isBlocking - Whether to block navigation (typically when form is dirty)
 */
export function useUnsavedChangesWarning({
  isBlocking,
}: UnsavedChangesWarningProps) {
  const isBlockingRef = useRef(isBlocking)

  // Keep ref in sync with prop
  useEffect(() => {
    isBlockingRef.current = isBlocking
  }, [isBlocking])

  // Handle beforeunload (browser refresh, close tab, external navigation)
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isBlockingRef.current) {
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
