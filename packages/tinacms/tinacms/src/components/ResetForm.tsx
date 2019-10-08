import * as React from 'react'
import styled, { keyframes, css } from 'styled-components'
import { Button } from '@tinacms/fields'
import { padding, color } from '@tinacms/styles'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
} from './modals/ModalProvider'
import { CloseIcon } from '@tinacms/icons'
import { ModalPopup } from './modals/ModalPopup'

interface ResetFormProps {
  pristine: boolean
  reset(): void
}

export const ResetForm = ({ pristine, reset }: ResetFormProps) => {
  let [open, setOpen] = React.useState(false)
  return (
    <>
      <ResetButton
        onClick={() => {
          setOpen(p => !p)
        }}
        disabled={pristine}
      >
        Reset
      </ResetButton>
      {open && <ResetModal reset={reset} close={() => setOpen(false)} />}
    </>
  )
}

interface ResetModalProps {
  close(): void
  reset(): void
}

const ResetModal = ({ close, reset }: ResetModalProps) => {
  return (
    <Modal>
      <ModalPopup>
        <ModalHeader>
          Reset
          <CloseButton onClick={close}>
            <CloseIcon />
          </CloseButton>
        </ModalHeader>
        <ModalBody padded={true}>
          <p>Are you sure you want to reset all changes?</p>
        </ModalBody>
        <ModalActions>
          <CancelButton onClick={close}>Cancel</CancelButton>
          <ConfirmButton onClick={reset}>Reset</ConfirmButton>
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}

const ResetButton = styled(Button)`
  background-color: white;
  border: 1px solid #edecf3;
  color: #0084ff;
  flex: 0 0 6rem;
  padding: 0.75rem 1.5rem;
  margin-right: 0.5rem;
  &:hover {
    background-color: #f6f6f9;
    opacity: 1;
  }
`

const ConfirmButton = styled(Button)`
  padding: 0.75rem 1.5rem;
`

const CancelButton = styled(ConfirmButton)`
  background-color: white;
  border: 1px solid #edecf3;
  color: #0084ff;
  margin-right: 0.5rem;
  &:hover {
    background-color: #f6f6f9;
    opacity: 1;
  }
`

const CloseButton = styled.div`
  display: flex;
  align-items: center;
  fill: #e1ddec;
  cursor: pointer;
  transition: fill 85ms ease-out;
  svg {
    width: 1.5rem;
    height: auto;
  }
  &:hover {
    fill: ${color.grey(8)};
  }
`
