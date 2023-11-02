import * as React from 'react'
import { BranchSwitcherProps, Branch } from './types'
import { useBranchData } from './branch-data'
import { BaseTextField, FieldLabel, Select } from '@toolkit/fields'
import { Button, OverflowMenu } from '@toolkit/styles'
import { LoadingDots, PrefixedTextField } from '@toolkit/form-builder'
import {
  BiError,
  BiGitBranch,
  BiRefresh,
  BiSearch,
  BiLock,
  BiPencil,
  BiLinkExternal,
} from 'react-icons/bi'
import { GrCircleQuestion } from 'react-icons/gr'
import { MdArrowForward, MdOutlineClear } from 'react-icons/md'
import { AiFillWarning } from 'react-icons/ai'
import { FaSpinner } from 'react-icons/fa'
import { useCMS } from '@toolkit/react-core'
import { BranchSwitcherLegacy } from './branch-switcher-legacy'
import { formatDistanceToNow } from 'date-fns'

type ListState = 'loading' | 'ready' | 'error'

export function formatBranchName(str: string): string {
  const pattern = /[^/\w-]+/g // regular expression pattern to match invalid special characters
  const formattedStr = str.replace(pattern, '-') // remove special characters
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
  setModalTitle,
}: BranchSwitcherProps) => {
  const cms = useCMS()
  const isLocalMode = cms.api?.tina?.isLocalMode
  const [viewState, setViewState] = React.useState<'list' | 'create'>('list')
  const [listState, setListState] = React.useState<ListState>('loading')
  const [branchList, setBranchList] = React.useState([] as Branch[])
  const { currentBranch } = useBranchData()
  const initialBranch = React.useMemo(() => currentBranch, [])
  // when modal closes, refresh page is currentBranch has changed
  React.useEffect(() => {
    if (initialBranch != currentBranch) {
      window.location.reload()
    }
  }, [currentBranch])

  React.useEffect(() => {
    if (!setModalTitle) return
    if (viewState === 'create') {
      setModalTitle('Create Branch')
    } else {
      setModalTitle('Branch List')
    }
  }, [viewState, setModalTitle])

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
        ) : viewState === 'create' ? (
          <BranchCreator
            currentBranch={currentBranch}
            setViewState={setViewState}
            handleCreateBranch={handleCreateBranch}
          />
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
                createBranch={() => {
                  setViewState('create')
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
      // always show protected branches (e.g. main)
      if (branch.protected) return true
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

const BranchCreator = ({ setViewState, handleCreateBranch, currentBranch }) => {
  const [branchName, setBranchName] = React.useState('')

  return (
    <form>
      <div className="">
        <p className="text-base text-gray-700 mb-4">
          Create a new branch from <strong>{currentBranch}</strong>.
        </p>
        <div className="mb-3">
          <FieldLabel name="current-branch-name">
            Current Branch Name
          </FieldLabel>
          <BaseTextField
            name="current-branch-name"
            value={currentBranch}
            disabled
          />
        </div>
        <div className="mb-6">
          <FieldLabel name="branch-name">New Branch Name</FieldLabel>
          <PrefixedTextField
            placeholder=""
            name="branch-name"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />
        </div>
      </div>
      <div className="w-full flex justify-between gap-4 items-center">
        <Button
          style={{ flexGrow: 1 }}
          onClick={() => {
            setViewState('list')
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          style={{ flexGrow: 2 }}
          disabled={branchName === ''}
          onClick={() => {
            handleCreateBranch('tina/' + branchName)
          }}
        >
          Create Branch <BiGitBranch className="w-5 h-full ml-1 opacity-70" />
        </Button>
      </div>
    </form>
  )
}

const BranchSelector = ({
  branchList,
  currentBranch,
  onChange,
  createBranch,
}: {
  branchList: Branch[]
  currentBranch: string
  onChange: (branchName: string) => void
  createBranch: () => void
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

  const previewFunction = cms.api.tina.schema?.config?.config?.ui?.previewUrl

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end space-x-4">
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
        {/* TODO: Add this back when we implement on backend */}
        {/* <div className="flex-1" />
        <div>
          <Button variant="primary" onClick={createBranch}>
            Create Branch <BiPlus className="w-5 h-full ml-1 opacity-70" />
          </Button>
        </div> */}
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
                    ? 'border-blue-500 border-l-5 bg-blue-50 text-blue-800 border-b-0'
                    : 'border-b-2'
                }`}
                key={branch.name}
              >
                <div className="w-1/2">
                  <div className="flex items-center gap-1">
                    <div className="flex-0">
                      {branch.protected && (
                        <BiLock className="w-5 h-auto opacity-70 text-blue-500" />
                      )}
                    </div>
                    <div className="truncate flex-1">{branch.name}</div>
                  </div>
                  {indexingStatus !== 'complete' && (
                    <div className="w-fit">
                      <IndexStatus indexingStatus={branch.indexStatus.status} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold">Last Updated</div>
                  <span className="text-sm leading-tight">
                    {formatDistanceToNow(
                      new Date(branch.indexStatus.timestamp),
                      {
                        addSuffix: true,
                      }
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  {indexingStatus === 'complete' && !isCurrentBranch && (
                    <Button
                      variant="white"
                      size="custom"
                      onClick={() => {
                        onChange(branch.name)
                      }}
                      className="mr-auto cursor-pointer text-sm h-9 px-4 flex items-center gap-1"
                    >
                      <BiPencil className="h-4 w-auto text-blue-500 opacity-70 -mt-px" />{' '}
                      Select
                    </Button>
                  )}
                  {(branch.githubPullRequestUrl ||
                    typeof previewFunction === 'function') && (
                    <div className="ml-auto">
                      <OverflowMenu
                        toolbarItems={[
                          branch.githubPullRequestUrl && {
                            name: 'github-pr',
                            label: 'View in GitHub',
                            Icon: (
                              <BiLinkExternal className="w-5 h-auto text-blue-500 opacity-70" />
                            ),
                            onMouseDown: () => {
                              window.open(branch.githubPullRequestUrl, '_blank')
                            },
                          },
                          typeof previewFunction === 'function' &&
                            previewFunction({ branch: branch.name })?.url && {
                              name: 'preview',
                              label: 'Preview',
                              onMouseDown: () => {
                                const previewUrl = previewFunction({
                                  branch: branch.name,
                                })?.url
                                window.open(previewUrl, '_blank')
                              },
                            },
                        ].filter(Boolean)}
                      />
                    </div>
                  )}
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
