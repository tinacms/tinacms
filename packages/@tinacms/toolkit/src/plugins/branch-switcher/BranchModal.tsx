import * as React from 'react'
import {
  Modal,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../../packages/react-modals'
import { useCMS } from '../../react-tinacms'
import { useBranchData } from './BranchData'
import { BranchSwitcher } from './BranchSwitcher'

interface SubmitModalProps {
  close(): void
}

export const BranchModal = ({ close }: SubmitModalProps) => {
  const tinaApi = useCMS().api.tina
  const { setCurrentBranch } = useBranchData()

  return (
    <Modal>
      <PopupModal className=" w-[800px]">
        <ModalHeader close={close}>Branch List</ModalHeader>
        <ModalBody padded={false}>
          <BranchSwitcher
            listBranches={tinaApi.listBranches.bind(tinaApi)}
            createBranch={async (data) => {
              return await tinaApi.createBranch(data)
            }}
            chooseBranch={setCurrentBranch}
          />
        </ModalBody>
      </PopupModal>
    </Modal>
  )
}
