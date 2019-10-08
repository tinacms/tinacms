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
          <Button onClick={close}>Cancel</Button>
          <Button 
            margin 
            primary
            onClick={async () => {
              await reset()
              close()
            }}  
          >
            Reset
          </Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}

const ResetButton = styled(Button)`
  flex: 0 0 6rem;
`

const CloseButton = styled.div`
  display: flex;
  align-items: center;
  fill: ${color.grey(3)};
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
