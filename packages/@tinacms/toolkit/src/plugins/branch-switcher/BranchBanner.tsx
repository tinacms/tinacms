import * as React from 'react'
import { BiChevronDown, BiGitBranch, BiLinkExternal } from 'react-icons/bi'
import { FaSpinner } from 'react-icons/fa'
import {
  Modal,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../../packages/react-modals'
import { useCMS } from '../../react-tinacms'
import { useBranchData } from './BranchData'
import { BranchSwitcher } from './BranchSwitcher'

export const BranchBanner = () => {
  const [open, setOpen] = React.useState(false)
  const openModal = () => setOpen(true)
  const { currentBranch } = useBranchData()

  return (
    <>
      {' '}
      <div className="flex-grow-0 flex justify-between w-full text-xs items-center py-2 px-4 text-gray-500 bg-gradient-to-r from-white to-gray-50 border-b border-gray-150 gap-2">
        <span className="flex items-center justify-start gap-2 flex-1">
          <BiGitBranch className="w-5 h-auto text-blue-500/70" /> Branch
          <BranchButton currentBranch={currentBranch} openModal={openModal} />
        </span>
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

const BranchButton = ({ currentBranch = 'main', openModal }) => {
  return (
    <button
      className="flex gap-1.5 items-center justify-between form-select h-7 px-2.5 border border-gray-200 bg-white text-gray-700 hover:text-blue-500 transition-color duration-150 ease-out rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out text-[12px] leading-tight capitalize min-w-[5rem]"
      onClick={openModal}
    >
      {currentBranch}
      <BiChevronDown
        className="-mr-1 -ml-1 h-4 w-4 opacity-70"
        aria-hidden="true"
      />
    </button>
  )
}

const BranchModal = ({ close }: SubmitModalProps) => {
  const tinaApi = useCMS().api.tina
  const { setCurrentBranch } = useBranchData()

  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Select Branch</ModalHeader>
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
