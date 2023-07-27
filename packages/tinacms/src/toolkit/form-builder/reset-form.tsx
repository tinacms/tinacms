import * as React from 'react'
import { FC } from 'react'
import { Button } from '@toolkit/styles'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
  ModalPopup,
} from '../react-modals'

interface ResetFormProps {
  children: any
  pristine: boolean
  reset(): void
  style?: React.CSSProperties
}

export const ResetForm: FC<ResetFormProps> = ({
  pristine,
  reset,
  children,
  ...props
}: ResetFormProps) => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button
        onClick={() => {
          setOpen((p) => !p)
        }}
        disabled={pristine}
        {...props}
      >
        {children}
      </Button>
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
        <ModalHeader close={close}>Reset</ModalHeader>
        <ModalBody padded={true}>
          <p>Are you sure you want to reset all changes?</p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            variant="primary"
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
