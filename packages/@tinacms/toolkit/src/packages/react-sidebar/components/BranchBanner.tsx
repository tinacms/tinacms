import * as React from 'react'
import { BranchSwitcher } from '../../../plugins/branch-switcher'
import { useCMS } from '../../../react-tinacms'
import { Modal, ModalBody, ModalHeader, ModalPopup } from '../../react-modals'

export const BranchBanner = () => {
  const { branch } = useCMS().api.tina
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
  const { listBranches } = useCMS().api.tina

  return (
    <Modal>
      <ModalPopup>
        <ModalHeader close={close}>Choose Workspace</ModalHeader>
        <ModalBody padded={true}>
          <BranchSwitcher
            listBranches={listBranches}
            createBranch={() => {
              return Promise.resolve('')
            }}
          />
        </ModalBody>
      </ModalPopup>
    </Modal>
  )
}
