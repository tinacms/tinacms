import * as React from 'react'
import { useCMS } from '../../../react-tinacms'
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  ModalPopup,
} from '../../react-modals'
import { Button } from '../../styles'

export const BranchBanner = () => {
  const branch = useCMS().api.tina.branch || 'main'
  const [open, setOpen] = React.useState(false)
  return (
    <>
      {' '}
      <div className="flex-grow-0 flex w-full text-xs items-center py-1 px-4 text-yellow-600 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200 cursor-pointer">
        Working from{' '}
        <strong
          onClick={() => setOpen(true)}
          className="ml-1 font-bold text-yellow-700"
        >
          {branch}
        </strong>
      </div>
      {open && (
        <BranchModal
          close={() => {
            setOpen(false)
          }}
        />
      )}
    </>
  )
}

interface SubmitModalProps {
  close(): void
}

const BranchModal = ({ close }: SubmitModalProps) => {
  const branch = useCMS().api.tina.branch || 'main'

  return (
    <Modal>
      <ModalPopup>
        <ModalHeader close={close}>Choose Workspace</ModalHeader>
        <ModalBody padded={true}>
          <p>
            You are currently editing on <strong>"{branch}</strong>
          </p>
          <select>
            <option>Foo</option>
            <option>Bar</option>
            <option>Foobar</option>
          </select>
        </ModalBody>
        <ModalActions>
          <Button
            style={{ flexGrow: 3 }}
            onClick={async () => {
              close()
            }}
          >
            Switch Workspace
          </Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}
