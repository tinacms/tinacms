import * as React from 'react'
import { BiGitBranch, BiLinkExternal } from 'react-icons/bi'
import { FaSpinner } from 'react-icons/fa'
import { BranchSwitcher, useBranchData } from '../../../plugins/branch-switcher'
import { useCMS } from '../../../react-tinacms'
import { Modal, ModalBody, ModalHeader, PopupModal } from '../../react-modals'
import { Button } from '../../styles'

export const BranchBanner = () => {
  const [open, setOpen] = React.useState(false)
  const openModal = () => setOpen(true)

  return (
    <>
      {' '}
      <div className="flex-grow-0 flex justify-between w-full text-xs items-center py-2 px-4 text-gray-500 bg-gradient-to-r from-white to-gray-50 border-b border-gray-150 gap-2">
        <span className="flex items-center justify-start gap-1 flex-1">
          <BiGitBranch className="w-5 h-auto text-blue-500/70" /> Branch
          <BranchSelector openModal={openModal} />
        </span>
        <Button
          className="group text-[12px] h-7 px-3 flex-shrink-0 gap-1"
          size="custom"
          variant="white"
          onClick={() => {}}
        >
          <BiLinkExternal className="w-4 h-auto text-blue-500 opacity-70 mr-1" />
          {/* <FaSpinner className="w-4 h-auto text-blue-500 opacity-70 mr-1 animate-spin" /> */}
          Preview
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

const BranchSelector = ({ openModal }) => {
  const [listState, setListState] = React.useState('loading')
  const [branchList, setBranchList] = React.useState([])
  const { branch } = useCMS().api.tina || 'main'
  const isDefaultBranch = branch === 'main' || branch === 'master'
  const tinaApi = useCMS().api.tina
  const { setCurrentBranch } = useBranchData()

  const refreshBranchList = React.useCallback(async () => {
    setListState('loading')
    await tinaApi
      .listBranches()
      .then((data) => {
        setBranchList(data)
        setListState('ready')
      })
      .catch(() => setListState('error'))
  }, [])

  // load branch list
  React.useEffect(() => {
    refreshBranchList()
  }, [])

  if (listState === 'loading') {
    return (
      <span className="flex items-center gap-1 form-select h-7 px-2 ml-1 border border-gray-200 bg-white text-gray-700 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out text-[12px] leading-tight capitalize">
        <FaSpinner className="w-4 h-auto text-blue-500 opacity-70 mr-1 animate-spin" />{' '}
        Loading...
      </span>
    )
  }

  return (
    <select
      className="inline-block form-select h-7 pl-1 pr-3 ml-1 border border-gray-200 bg-white text-gray-700 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out text-[12px] leading-tight capitalize"
      onChange={(event) => {
        console.log(event.target.value)
        if (event.target.value === 'create-new-branch') {
          openModal()
        } else {
          setCurrentBranch(event.target.value)
        }
      }}
    >
      {branchList.length > 0 &&
        branchList.map((branchOption) => {
          return (
            <option
              key={branchOption.name}
              value={branchOption.name}
              selected={branchOption.name === branch}
            >
              {branchOption.name}
            </option>
          )
        })}
      <option key={'create-new-branch'} value="create-new-branch">
        Create New Branch
      </option>
    </select>
  )
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
