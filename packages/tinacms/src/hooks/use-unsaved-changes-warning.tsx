import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@toolkit/styles'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
  ModalPopup,
} from '@toolkit/react-modals'

interface UnsavedChangesWarningProps {
  isBlocking: boolean
  onConfirmLeave?: () => void
}

interface UnsavedChangesModalProps {
  onStay: () => void
  onLeave: () => void
}

const UnsavedChangesModal = ({ onStay, onLeave }: UnsavedChangesModalProps) => {
  return (
    <Modal>
      <ModalPopup>
        <ModalHeader close={onStay}>Unsaved Changes</ModalHeader>
        <ModalBody padded={true}>
          <p>
            You have unsaved changes. Are you sure you want to leave? Your
            changes will be lost.
          </p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} variant="primary" onClick={onStay}>
            Stay on Page
          </Button>
          <Button style={{ flexGrow: 1 }} onClick={onLeave}>
            Leave
          </Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}

/**
 * Hook to warn users about unsaved changes when navigating away.
 *
 * Handles:
 * - Browser refresh/close (beforeunload event)
 * - Browser back/forward buttons (popstate event)
 *
 * @param isBlocking - Whether to block navigation (typically when form is dirty)
 * @param onConfirmLeave - Optional callback when user confirms leaving
 * @returns Object containing the modal component to render
 */
export function useUnsavedChangesWarning({
  isBlocking,
  onConfirmLeave,
}: UnsavedChangesWarningProps) {
  const [showModal, setShowModal] = useState(false)
  const pendingNavigationRef = useRef<(() => void) | null>(null)
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

  // Handle browser back/forward navigation (popstate)
  useEffect(() => {
    // Push a dummy state to detect back navigation
    const currentState = window.history.state
    const stateKey = '__unsavedChangesGuard'

    // Only push if we haven't already
    if (!currentState?.[stateKey]) {
      window.history.pushState(
        { ...currentState, [stateKey]: true },
        '',
        window.location.href
      )
    }

    const onPopState = (event: PopStateEvent) => {
      if (isBlockingRef.current) {
        // Prevent the navigation by pushing state back
        window.history.pushState(
          { ...event.state, [stateKey]: true },
          '',
          window.location.href
        )

        // Store the pending navigation action
        pendingNavigationRef.current = () => {
          // Allow the navigation by going back
          window.history.back()
        }

        setShowModal(true)
      }
    }

    window.addEventListener('popstate', onPopState)

    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  const handleStay = useCallback(() => {
    pendingNavigationRef.current = null
    setShowModal(false)
  }, [])

  const handleLeave = useCallback(() => {
    setShowModal(false)
    onConfirmLeave?.()

    // Execute the pending navigation
    if (pendingNavigationRef.current) {
      // Temporarily disable blocking
      isBlockingRef.current = false
      pendingNavigationRef.current()
      pendingNavigationRef.current = null
    }
  }, [onConfirmLeave])

  const UnsavedChangesWarningModal = showModal ? (
    <UnsavedChangesModal onStay={handleStay} onLeave={handleLeave} />
  ) : null

  return {
    UnsavedChangesWarningModal,
    showModal,
  }
}

export { UnsavedChangesModal }
