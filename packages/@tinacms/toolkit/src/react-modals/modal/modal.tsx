import * as React from 'react'
import { createPortal } from 'react-dom'
import { useModalContainer } from '../modal-provider'
import { ModalOverlay } from './modal-overlay'

export type ModalProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

export const Modal = (props: ModalProps) => {
  const { portalNode } = useModalContainer()

  if (!portalNode) return null

  return createPortal(
    <ModalOverlay>
      <div {...props} />
    </ModalOverlay>,
    portalNode
  )
}
