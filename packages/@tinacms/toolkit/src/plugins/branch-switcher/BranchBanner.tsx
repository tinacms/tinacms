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

enum PREVIEW_STATE {
  NOT_AVAILABLE,
  WAITING_FOR_PREVIEW,
  PREVIEW_READY,
}

const usePreviewStatus = () => {
  const cms = useCMS()
  const client = cms.api.tina

  const [previewUrl, setPreviewUrl] = React.useState('')
  const [previewState, setPreviewState] = React.useState<PREVIEW_STATE>(
    PREVIEW_STATE.NOT_AVAILABLE
  )
  React.useEffect(() => {
    const interval = setInterval(async () => {
      const pullNumber = window.localStorage.getItem(
        'tinacms-current-pull-number'
      )
      const res = await client.vercelStatus({ pullNumber })

      if (res.status?.toLowerCase() === 'ready') {
        setPreviewUrl(res.previewUrl)
        setPreviewState(PREVIEW_STATE.PREVIEW_READY)
      } else if (res.status?.toLowerCase() === 'building') {
        setPreviewState(PREVIEW_STATE.WAITING_FOR_PREVIEW)
      } // TODO handle error
    }, 2000)
    return () => clearInterval(interval)
  }, [client, previewState, previewUrl, setPreviewState, setPreviewUrl, cms])

  return {
    previewUrl: previewUrl + window.location.href.split('#/~')[1],
    previewState,
  }
}

export const BranchBanner = () => {
  const [open, setOpen] = React.useState(false)
  const openModal = () => setOpen(true)
  const { currentBranch } = useBranchData()

  const { previewUrl, previewState } = usePreviewStatus()

  return (
    <>
      {' '}
      <div className="flex-grow-0 flex justify-between w-full text-xs items-center py-2 px-4 text-gray-500 bg-gradient-to-r from-white to-gray-50 border-b border-gray-150 gap-2">
        <span className="flex items-center justify-start gap-2 flex-1">
          <BiGitBranch className="w-5 h-auto text-blue-500/70" /> Branch
          <BranchButton currentBranch={currentBranch} openModal={openModal} />
        </span>
        {/* <Button
          className="group text-[12px] h-7 px-3 flex-shrink-0 gap-2"
          size="custom"
          variant="white"
          as="a"
          href={previewUrl || '#'}
          disabled={previewState !== PREVIEW_STATE.PREVIEW_READY}
        >
          {previewState === PREVIEW_STATE.WAITING_FOR_PREVIEW ? (
            <>
              <FaSpinner className="w-4 h-auto text-blue-500 opacity-70 animate-spin" />{' '}
              Building
            </>
          ) : (
            <>
              <BiLinkExternal className="w-4 h-auto text-blue-500 opacity-70" />{' '}
              Preview
            </>
          )}
        </Button> */}
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
