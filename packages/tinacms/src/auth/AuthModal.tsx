/**

*/

import {
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from '@tinacms/toolkit'
import { LoadingDots, Button } from '@tinacms/toolkit'
import React, { useCallback, useEffect, useState } from 'react'

interface ModalBuilderProps {
  title: string
  message?: string
  error?: string
  actions: ButtonProps[]
  close(): void
  children?: React.ReactNode
}

export function ModalBuilder(modalProps: ModalBuilderProps) {
  return (
    <Modal>
      <ModalPopup>
        <ModalHeader>{modalProps.title}</ModalHeader>
        <ModalBody padded>
          {modalProps.message && <p>{modalProps.message}</p>}
          {modalProps.error && <ErrorLabel>{modalProps.error}</ErrorLabel>}
          {modalProps.children}
        </ModalBody>
        <ModalActions>
          {modalProps.actions.map((action) => (
            <AsyncButton key={action.name} {...action} />
          ))}
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}

export const ErrorLabel = ({ style = {}, ...props }) => (
  <p style={{ ...style, color: 'var(--tina-color-error)' }} {...props} />
)

export interface ButtonProps {
  name: string
  action(): Promise<void>
  primary: boolean
}

export const AsyncButton = ({ name, primary, action }: ButtonProps) => {
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const onClick = useCallback(async () => {
    if (!mounted) return
    setSubmitting(true)
    try {
      await action()
      setSubmitting(false)
    } catch (e) {
      setSubmitting(false)
      throw e
    }
  }, [action, setSubmitting, mounted])

  return (
    <Button
      data-test={name.replace(/\s/g, '-').toLowerCase()}
      variant={primary ? 'primary' : 'secondary'}
      onClick={onClick}
      busy={submitting}
      disabled={submitting}
    >
      {submitting && <LoadingDots />}
      {!submitting && name}
    </Button>
  )
}
