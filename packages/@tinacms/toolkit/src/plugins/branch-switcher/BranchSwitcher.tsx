import * as React from 'react'
import { BranchSwitcherProps, Branch } from './types'
import { useBranchData } from './BranchData'
import { BaseTextField, Select } from '../../packages/fields'
import { Button, OverflowMenu } from '../../packages/styles'
import { LoadingDots } from '../../packages/form-builder'
import {
  BiError,
  BiGitBranch,
  BiPlus,
  BiRefresh,
  BiSearch,
  BiLock,
} from 'react-icons/bi'
import { GrCircleQuestion } from 'react-icons/gr'
import { MdArrowForward, MdOutlineClear } from 'react-icons/md'
import { AiFillWarning } from 'react-icons/ai'
import { FaSpinner } from 'react-icons/fa'
import { useCMS } from '../../packages/react-core'
import { BranchSwitcherLegacy } from './BranchSwitcherLegecy'
import { formatDistanceToNow } from 'date-fns'
import { Dropdown } from '../../packages/fields/plugins/MdxFieldPlugin/plate/plugins/ui/dropdown'

type ListState = 'loading' | 'ready' | 'error'

export function formatBranchName(str: string): string {
  const pattern = /[^/\w-]+/g // regular expression pattern to match invalid special characters
  const formattedStr = str.replace(pattern, '') // remove special characters
  return formattedStr.toLowerCase()
}

export const BranchSwitcher = (props: BranchSwitcherProps) => {
  const cms = useCMS()
  const usingEditorialWorkflow = cms.api.tina.usingEditorialWorkflow
  if (usingEditorialWorkflow) {
    return <EditoralBranchSwitcher {...props} />
  } else {
    return <BranchSwitcherLegacy {...props} />
  }
}

export const EditoralBranchSwitcher = ({
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

  console.log('List', branchList)

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
  search: string,
  currentBranchName: string,
  filter: 'content' | 'all' = 'all'
) => {
  const filteredBranchList = branchList
    .filter(
      (branch) =>
        !search ||
        branch.name.includes(search) ||
        branch.name === currentBranchName
    )
    .filter((branch) => {
      if (filter === 'all') return true
      if (filter === 'content') {
        return branch.name.startsWith('tina/')
      }
    })
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

const sortBranchListFn = (sortValue: 'default' | 'updated' | 'name') => {
  return (a: Branch, b: Branch) => {
    if (sortValue === 'default') {
      // Default sorting logic
      // Implement your own logic here if needed
      return 0
    } else if (sortValue === 'updated') {
      // Sort by last updated logic
      return b.indexStatus.timestamp - a.indexStatus.timestamp
    } else if (sortValue === 'name') {
      // Sort by branch name logic
      return a.name.localeCompare(b.name)
    }
  }
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
  const [search, setSearch] = React.useState('')
  const [filter, setFilter] = React.useState<'content' | 'all'>('content')
  const [sortValue, setSortValue] = React.useState<
    'default' | 'updated' | 'name'
  >('default')

  const cms = useCMS()

  const filteredBranchList = getFilteredBranchList(
    branchList,
    search,
    currentBranch,
    filter
  ).sort(sortBranchListFn(sortValue))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex space-x-4">
        <div>
          <label
            htmlFor="sort"
            className="text-xs mb-1 flex flex-col font-bold"
          >
            Sort By
          </label>
          <Select
            name="sort"
            input={{
              id: 'sort',
              name: 'sort',
              value: sortValue,
              onChange: (e: any) => setSortValue(e.target.value),
            }}
            options={[
              {
                label: 'Default',
                value: 'default',
              },
              {
                label: 'Last Updated',
                value: 'updated',
              },
              {
                label: 'Branch Name',
                value: 'name',
              },
            ]}
          />
        </div>
        <div>
          <label
            htmlFor="branch-type"
            className="text-xs mb-1 flex flex-col font-bold"
          >
            Branch Type
          </label>
          <Select
            name="branch-type"
            input={{
              id: 'branch-type',
              name: 'branch-type',
              value: filter,
              onChange: (e: any) => setFilter(e.target.value),
            }}
            options={[
              {
                label: 'Content',
                value: 'content',
              },
              {
                label: 'All',
                value: 'all',
              },
            ]}
          />
        </div>
        <div className="flex-1" />
        <div>
          <label
            htmlFor="search"
            className="text-xs mb-1 flex flex-col font-bold"
          >
            Search
          </label>
          <div className="block relative group h-fit mb-auto">
            <BaseTextField
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search === '' ? (
              <BiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-auto text-blue-500 opacity-70 group-hover:opacity-100 transition-all ease-out duration-150" />
            ) : (
              <button
                onClick={() => {
                  setSearch('')
                }}
                className="outline-none focus:outline-none bg-transparent border-0 p-0 m-0 absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-all ease-out duration-150"
              >
                <MdOutlineClear className="w-5 h-auto text-gray-600" />
              </button>
            )}
          </div>
        </div>
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
                className={`relative text-base py-1.5 px-3 flex items-center gap-1.5 border-l-0 border-t-0 border-r-0 border-gray-50 w-full outline-none transition-all ease-out duration-150 ${
                  indexingStatus !== 'complete'
                    ? 'bg-gray-50 text-gray-400'
                    : isCurrentBranch
                    ? 'border-teal-500 border-l-4 bg-blue-50 text-blue-800 border-b-0'
                    : 'border-b-2'
                }`}
                key={branch.name}
              >
                <div className="w-1/2">
                  <div className="w-fit max-w-full">
                    <div className="my-auto">
                      {branch.protected && <BiLock />}
                    </div>
                    <div className="truncate w-fit max-w-full">
                      {branch.name}
                    </div>
                  </div>
                  {indexingStatus !== 'complete' && (
                    <div className="w-fit">
                      <IndexStatus indexingStatus={branch.indexStatus.status} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold mb-1">Last Updated</div>
                  {formatDistanceToNow(new Date(branch.indexStatus.timestamp), {
                    addSuffix: true,
                  })}
                </div>
                <div className="flex items-center">
                  {indexingStatus === 'complete' && !isCurrentBranch && (
                    <Button
                      onClick={() => {
                        onChange(branch.name)
                      }}
                      className="mr-auto cursor-pointer"
                    >
                      Edit
                    </Button>
                  )}
                  <div className="ml-auto">
                    <OverflowMenu
                      toolbarItems={[
                        {
                          name: 'github-pr',
                          label: 'View in Github',
                          onMouseDown: () => {
                            window.open(branch.githubPullRequestUrl, '_blank')
                          },
                        },
                        ...(cms.api.tina.schema?.config?.config?.ui?.previewUrl
                          ? [
                              {
                                name: 'preview',
                                label: 'Preview',
                                onMouseDown: () => {
                                  window.open(
                                    cms.api.tina.schema?.config?.config?.ui?.previewUrl(
                                      { branch: branch.name }
                                    ),
                                    '_blank'
                                  )
                                },
                              },
                            ]
                          : []),
                      ]}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

type Status = 'failed' | 'unknown' | 'complete' | 'inprogress' | 'timeout'

const IndexStatus = ({ indexingStatus }: { indexingStatus: Status }) => {
  const styles: {
    [key in Status]: {
      classes: string
      content: () => JSX.Element
    }
  } = {
    complete: {
      classes: '',
      content: () => <></>,
    },
    unknown: {
      classes: 'text-blue-500 border-blue-500',
      content: () => (
        <>
          <GrCircleQuestion className="w-3 h-auto" />
          <span className="">{`Unknown`}</span>
        </>
      ),
    },
    inprogress: {
      classes: 'text-blue-500 border-blue-500',
      content: () => (
        <>
          <FaSpinner className="w-3 h-auto animate-spin" />
          <span className="">{`Indexing`}</span>
        </>
      ),
    },
    failed: {
      classes: 'text-red-500 border-red-500',
      content: () => (
        <>
          <BiError className="w-3 h-auto" />
          <span className="">{`Indexing failed`}</span>
        </>
      ),
    },
    timeout: {
      classes: 'text-red-500 border-red-500',
      content: () => (
        <>
          <BiError className="w-3 h-auto" />
          <span className="">{`Indexing timed out`}</span>
        </>
      ),
    },
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border space-x-1 ${styles[indexingStatus].classes}`}
    >
      {styles[indexingStatus].content()}
    </span>
  )
}
