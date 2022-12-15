import * as React from 'react'
import { BiError, BiSync } from 'react-icons/bi'
import { BranchSwitcher, useBranchData } from '../../../plugins/branch-switcher'
import { useCMS } from '../../../react-tinacms'
import { Modal, ModalBody, ModalHeader, PopupModal } from '../../react-modals'
import { Button } from '../../styles'

export const BranchBanner = () => {
  const { branch } = useCMS().api.tina || 'main'
  const [open, setOpen] = React.useState(false)
  return (
    <>
      {' '}
      <div className="flex-grow-0 flex justify-between w-full text-xs items-center py-1 px-4 text-yellow-600 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200 cursor-pointer gap-2">
        <span className="flex items-center gap-2 flex-1">
          <BiError className="w-5 h-auto text-yellow-500/70" /> Working from
          <strong
            onClick={() => setOpen(true)}
            className="font-bold text-yellow-700 truncate flex-1"
          >
            {branch}
          </strong>
        </span>
        <Button
          className="text-[11px] h-7 px-3 flex-shrink-0"
          size="custom"
          variant="white"
          onClick={() => setOpen(true)}
        >
          <BiSync className="w-5 h-auto text-blue-500 opacity-70" /> Change
          Deployment
        </Button>
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
  const tinaApi = useCMS().api.tina
  const { setCurrentBranch } = useBranchData()

  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Choose Workspace</ModalHeader>
        <ModalBody padded={false}>
          <BranchSwitcher
            listBranches={tinaApi.listBranches.bind(tinaApi)}
            createBranch={() => {
              return Promise.resolve('')
            }}
            chooseBranch={setCurrentBranch}
          />
        </ModalBody>
      </PopupModal>
    </Modal>
  )
}
