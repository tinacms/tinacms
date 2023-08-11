import * as React from 'react'
import { BranchSwitcherProps, Branch } from './types'
import { useBranchData } from './branch-data'
import { BaseTextField, Input } from '@toolkit/fields'
import { Button } from '@toolkit/styles'
import { LoadingDots } from '@toolkit/form-builder'
import {
  BiError,
  BiGitBranch,
  BiPlus,
  BiRefresh,
  BiSearch,
} from 'react-icons/bi'
import { GrCircleQuestion } from 'react-icons/gr'
import { MdArrowForward, MdOutlineClear } from 'react-icons/md'
import { AiFillWarning } from 'react-icons/ai'
import { FaSpinner } from 'react-icons/fa'
import { useCMS } from '@toolkit/react-core'

type ListState = 'loading' | 'ready' | 'error'

export function formatBranchName(str: string): string {
  const pattern = /[^/\w-]+/g // regular expression pattern to match invalid special characters
  const formattedStr = str.replace(pattern, '') // remove special characters
  return formattedStr.toLowerCase()
}

export const BranchSwitcherLegacy = ({
  listBranches,
  createBranch,
  chooseBranch,
}: BranchSwitcherProps) => {
  const cms = useCMS()
  const isLocalMode = cms.api?.tina?.isLocalMode
  const [listState, setListState] = React.useState<ListState>('loading')
  const [branchList, setBranchList] = React.useState([] as Branch[])
  const { currentBranch } = useBranchData()
  const initialBranch = React.useMemo(() => currentBranch, [])
  // when modal closes, refresh page is currentBranch has changed
  React.useEffect(() => {
    return () => {
      if (initialBranch != currentBranch) {
        window.location.reload()
      }
    }
  }, [currentBranch])

  const handleCreateBranch = React.useCallback((value) => {
    setListState('loading')
    createBranch({
      branchName: formatBranchName(value),
      baseBranch: currentBranch,
    }).then(async (createdBranchName) => {
      // @ts-ignore
      cms.alerts.success('Branch created.')
      // add the newly created branch to the list
      setBranchList((oldBranchList) => {
        return [
          ...oldBranchList,
          {
            indexStatus: { status: 'unknown' },
            name: createdBranchName,
          },
        ]
      })
      setListState('ready')
    })
  }, [])

  const refreshBranchList = React.useCallback(async () => {
    setListState('loading')
    await listBranches()
      .then((data: Branch[]) => {
        setBranchList(data)
        setListState('ready')
      })
      .catch(() => setListState('error'))
  }, [])

  // load branch list
  React.useEffect(() => {
    refreshBranchList()
  }, [])

  // Keep branch list up to date
  React.useEffect(() => {
    if (listState === 'ready') {
      const cancelFuncs = []
      // update all branches that have indexing status of 'inprogress' or 'unknown'
      branchList
        .filter(
          (x) =>
            x?.indexStatus?.status === 'inprogress' ||
            x?.indexStatus?.status === 'unknown'
        )
        .forEach(async (x) => {
          const [
            // When this promise resolves, we know the index status is no longer 'inprogress' or 'unknown'
            waitForIndexStatusPromise,
            // Calling this function will cancel the polling
            cancelWaitForIndexFunc,
          ] = cms.api.tina.waitForIndexStatus({
            ref: x.name,
          })
          cancelFuncs.push(cancelWaitForIndexFunc)
          waitForIndexStatusPromise
            // @ts-ignore
            .then((indexStatus) => {
              setBranchList((previousBranchList) => {
                // update the index status of the branch
                const newBranchList = Array.from(previousBranchList)
                const index = newBranchList.findIndex((y) => y.name === x.name)
                newBranchList[index].indexStatus = indexStatus
                return newBranchList
              })
            })
            .catch((e) => {
              if (e.message === 'AsyncPoller: cancelled') return
              console.error(e)
            })
        })
      return () => {
        cancelFuncs.forEach((x) => {
          x()
        })
      }
    }
  }, [listState, branchList.length])

  return (
    <div className="w-full flex justify-center p-5">
      <div className="w-full max-w-form">
        {isLocalMode ? (
          <div className="px-6 py-8 w-full h-full flex flex-col items-center justify-center">
            <p className="text-base mb-4 text-center">
              <AiFillWarning className="w-7 h-auto inline-block mr-0.5 opacity-70 text-yellow-600" />
            </p>
            <p className="text-base mb-6 text-center">
              Tina's branch switcher isn't available in local mode.{' '}
              <a
                target="_blank"
                className="transition-all duration-150 ease-out text-blue-600 hover:text-blue-400 hover:underline no-underline"
                href="https://tina.io/docs/tina-cloud/"
              >
                Learn more about moving to production with Tina Cloud.
              </a>
            </p>
            <p>
              <Button
                href="https://tina.io/docs/tina-cloud/"
                target="_blank"
                as="a"
              >
                Read Our Docs{' '}
                <MdArrowForward className="w-5 h-auto ml-1.5 opacity-80" />
              </Button>
            </p>
          </div>
        ) : listState === 'loading' ? (
          <div style={{ margin: '32px auto', textAlign: 'center' }}>
            <LoadingDots color={'var(--tina-color-primary)'} />
          </div>
        ) : (
          <>
            {listState === 'ready' ? (
              <BranchSelector
                currentBranch={currentBranch}
                branchList={branchList}
                onCreateBranch={(newBranch) => {
                  handleCreateBranch(newBranch)
                }}
                onChange={(branchName) => {
                  chooseBranch(branchName)
                }}
              />
            ) : (
              <div className="px-6 py-8 w-full h-full flex flex-col items-center justify-center">
                <p className="text-base mb-4 text-center">
                  An error occurred while retrieving the branch list.
                </p>
                <Button className="mb-4" onClick={refreshBranchList}>
                  Try again <BiRefresh className="w-6 h-full ml-1 opacity-70" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export const getFilteredBranchList = (
  branchList: Branch[],
  filter: string,
  currentBranchName: string
) => {
  const filteredBranchList = branchList.filter(
    (branch) =>
      !filter ||
      branch.name.includes(filter) ||
      branch.name === currentBranchName
  )
  const currentBranchItem = branchList.find(
    (branch) => branch.name === currentBranchName
  )

  // return list with current branch at top
  return [
    currentBranchItem ||
      ({
        name: currentBranchName,
        indexStatus: { status: 'failed' },
      } as Branch),
    ...filteredBranchList.filter((branch) => branch.name !== currentBranchName),
  ]
}

const BranchSelector = ({
  branchList,
  currentBranch,
  onCreateBranch,
  onChange,
}: {
  branchList: Branch[]
  currentBranch: string
  onCreateBranch: (branchName: string) => void
  onChange: (branchName: string) => void
}) => {
  const [newBranchName, setNewBranchName] = React.useState('')
  const [filter, setFilter] = React.useState('')
  const filteredBranchList = getFilteredBranchList(
    branchList,
    filter,
    currentBranch
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="block relative group">
        <BaseTextField
          placeholder="Search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        {filter === '' ? (
          <BiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-auto text-blue-500 opacity-70 group-hover:opacity-100 transition-all ease-out duration-150" />
        ) : (
          <button
            onClick={() => {
              setFilter('')
            }}
            className="outline-none focus:outline-none bg-transparent border-0 p-0 m-0 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-all ease-out duration-150"
          >
            <MdOutlineClear className="w-5 h-auto text-gray-600" />
          </button>
        )}
      </div>
      {filteredBranchList.length === 0 && (
        <div className="block relative text-gray-300 italic py-1">
          No branches to display
        </div>
      )}
      {filteredBranchList.length > 0 && (
        <div className="min-w-[192px] max-h-[24rem] overflow-y-auto flex flex-col w-full h-full rounded-lg shadow-inner bg-white border border-gray-200">
          {filteredBranchList.map((branch) => {
            const isCurrentBranch = branch.name === currentBranch
            // @ts-ignore
            const indexingStatus = branch?.indexStatus?.status
            return (
              <div
                className={`relative text-base py-1.5 px-3 flex items-center gap-1.5 border-l-0 border-t-0 border-r-0 border-b border-gray-50 w-full outline-none transition-all ease-out duration-150 ${
                  indexingStatus !== 'complete'
                    ? 'bg-gray-50 text-gray-400 pointer-events-none'
                    : isCurrentBranch
                    ? 'cursor-pointer bg-blue-50 text-blue-800 pointer-events-none hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50'
                    : 'cursor-pointer hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50'
                }`}
                key={branch.name}
                onClick={() => {
                  if (indexingStatus === 'complete') {
                    onChange(branch.name)
                  }
                }}
              >
                {isCurrentBranch && (
                  <BiGitBranch className="w-5 h-auto text-blue-500/70" />
                )}
                {branch.name}
                {indexingStatus === 'unknown' && (
                  <span className="flex-1 w-full flex justify-end items-center gap-2 text-blue-500">
                    <span className="opacity-50 italic">{`Unknown`}</span>
                    <GrCircleQuestion className="w-5 h-auto opacity-70" />
                  </span>
                )}
                {indexingStatus === 'inprogress' && (
                  <span className="flex-1 w-full flex justify-end items-center gap-2 text-blue-500">
                    <span className="opacity-50 italic">{`Indexing`}</span>
                    <FaSpinner className="w-5 h-auto opacity-70 animate-spin" />
                  </span>
                )}
                {indexingStatus === 'failed' && (
                  <span className="flex-1 w-full flex justify-end items-center gap-2 text-red-500">
                    <span className="opacity-50 italic">{`Indexing failed`}</span>
                    <BiError className="w-5 h-auto opacity-70" />
                  </span>
                )}
                {indexingStatus === 'timeout' && (
                  <span className="flex-1 w-full flex justify-end items-center gap-2 text-red-500">
                    <span className="opacity-50 italic">{`Indexing timed out`}</span>
                    <BiError className="w-5 h-auto opacity-70" />
                  </span>
                )}
                {isCurrentBranch && (
                  <span className="opacity-70 italic">{` (current)`}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
      <CreateBranch
        {...{ onCreateBranch, currentBranch, newBranchName, setNewBranchName }}
      />
    </div>
  )
}

export const CreateBranch: React.FC<{
  setNewBranchName: (value: any) => void
  onCreateBranch: (value: string) => void
  currentBranch: string
  newBranchName: string
}> = ({ currentBranch, newBranchName, onCreateBranch, setNewBranchName }) => {
  return (
    <div className="border-t border-gray-150 pt-4 mt-3 flex flex-col gap-3">
      <div className="text-sm">
        Create a new branch from <b>{currentBranch}</b>. Once created you will
        need to wait for indexing to complete before you can switch branches.
      </div>
      <div className="flex justify-between items-center w-full gap-3">
        <BaseTextField
          placeholder="Branch Name"
          value={newBranchName}
          onChange={(e) => setNewBranchName(e.target.value)}
        />
        <Button
          className="flex-0 flex items-center gap-2 whitespace-nowrap"
          size="medium"
          variant="white"
          disabled={newBranchName === ''}
          onClick={() => onCreateBranch(newBranchName)}
        >
          <BiPlus className="w-5 h-auto opacity-70" /> Create Branch
        </Button>
      </div>
    </div>
  )
}
