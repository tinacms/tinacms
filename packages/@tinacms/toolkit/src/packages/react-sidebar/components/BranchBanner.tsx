import * as React from 'react'
import { BiGitBranch, BiLinkExternal } from 'react-icons/bi'
import { FaSpinner } from 'react-icons/fa'
import { BranchCreator, useBranchData } from '../../../plugins/branch-switcher'
import { useCMS } from '../../../react-tinacms'
import { Modal, ModalBody, ModalHeader, PopupModal } from '../../react-modals'
import { Button } from '../../styles'

enum PREVIEW_STATE {
  NOT_AVAILABLE,
  WAITING_FOR_PREVIEW,
  PREVIEW_READY,
}

const usePreviewStatus = ({ cms }) => {
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
  const cms = useCMS()
  const [open, setOpen] = React.useState(false)
  const [rerender, setRerender] = React.useState(false)
  const openModal = () => setOpen(true)

  const { previewUrl, previewState } = usePreviewStatus({ cms })

  return (
    <>
      {' '}
      <div className="flex-grow-0 flex justify-between w-full text-xs items-center py-2 px-4 text-gray-500 bg-gradient-to-r from-white to-gray-50 border-b border-gray-150 gap-2">
        <span className="flex items-center justify-start gap-1 flex-1">
          <BiGitBranch className="w-5 h-auto text-blue-500/70" /> Branch
          <BranchSelector rerender={rerender} openModal={openModal} />
        </span>
        <Button
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
        </Button>
      </div>
      {open && (
        <CreateBranchModal
          close={() => {
            setOpen(false)
          }}
          callback={(name) => {
            setOpen(false)
            setRerender(!rerender)
            cms.alerts?.success(`Created branch ${name}.`)
          }}
        />
      )}
    </>
  )
}

const BranchSelector = ({ openModal, rerender = false }) => {
  const selectRef = React.useRef<HTMLSelectElement>(null)
  const [listState, setListState] = React.useState('loading')
  const [branchList, setBranchList] = React.useState([])
  const cms = useCMS()
  const { branch } = useCMS().api.tina || 'main'
  const { setCurrentBranch } = useBranchData()

  const refreshBranchList = React.useCallback(async () => {
    setListState('loading')
    // @ts-ignore
    await cms.api.tina
      .listBranches()
      .then((data) => {
        setBranchList(data)
        setListState('ready')
      })
      .catch(() => setListState('error'))
  }, [cms])

  React.useEffect(() => {
    if (!cms) return
    refreshBranchList()
  }, [cms, rerender])

  const changeBranch = (event) => {
    if (event.target.value === 'create-new-branch') {
      openModal()
      selectRef.current.value = branch
      selectRef.current.blur()
    } else {
      setCurrentBranch(event.target.value)
      cms.alerts.success('Switched to branch ' + event.target.value + '.')
      selectRef.current.blur()

      setTimeout(() => {
        window.location.reload()
      }, 750)
    }
  }

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
      onChange={changeBranch}
      ref={selectRef}
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

const CreateBranchModal = ({ close, callback }) => {
  const { setCurrentBranch } = useBranchData()

  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Create Branch</ModalHeader>
        <div className="p-5 m-0 overflow-hidden flex flex-col [&:last-child]:rounded-[0_0_5px_5px] ">
          <BranchCreator
            createBranch={() => {
              return Promise.resolve('')
            }}
            chooseBranch={setCurrentBranch}
            callback={callback}
          />
        </div>
      </PopupModal>
    </Modal>
  )
}
