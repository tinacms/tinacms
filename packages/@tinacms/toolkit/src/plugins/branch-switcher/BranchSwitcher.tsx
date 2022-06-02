/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as React from 'react'
import { BranchSwitcherProps, Branch } from './types'
import { useBranchData } from './BranchData'
import { BaseTextField } from '../../packages/fields'
import { Button } from '../../packages/styles'
import { LoadingDots } from '../../packages/form-builder'
import { BiPlus, BiRefresh, BiSearch } from 'react-icons/bi'
import { MdArrowForward, MdOutlineClear } from 'react-icons/md'
import { useCMS } from '../../packages/react-core'
import { AiFillWarning } from 'react-icons/ai'

type ListState = 'loading' | 'ready' | 'error'

export const BranchSwitcher = ({
  listBranches,
  createBranch,
}: BranchSwitcherProps) => {
  const cms = useCMS()
  const isLocalMode = cms.api?.tina?.isLocalMode
  const [listState, setListState] = React.useState<ListState>('loading')
  const [branchList, setBranchList] = React.useState([])
  const { currentBranch, setCurrentBranch } = useBranchData()

  const handleCreateBranch = React.useCallback((value) => {
    setListState('loading')
    createBranch({
      branchName: value,
      baseBranch: currentBranch,
    }).then(async (createdBranchName) => {
      setCurrentBranch(createdBranchName)
      await refreshBranchList()
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
                  setCurrentBranch(branchName)
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

const BranchSelector = ({
  branchList,
  currentBranch,
  onCreateBranch,
  onChange,
}) => {
  const [newBranchName, setNewBranchName] = React.useState('')
  const [filter, setFilter] = React.useState('')
  const filteredBranchList = branchList.filter(
    (branch) => !filter || branch.name.includes(filter)
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
            return (
              <div
                className={`cursor-pointer relative text-base py-1.5 px-3 border-l-0 border-t-0 border-r-0 border-b border-gray-50 w-full outline-none transition-all ease-out duration-150 hover:text-blue-500 focus:text-blue-500 focus:bg-gray-50 hover:bg-gray-50 ${
                  isCurrentBranch
                    ? 'bg-blue-50 text-blue-800 pointer-events-none'
                    : ''
                }`}
                key={branch}
                onClick={() => onChange(branch.name)}
              >
                {branch.name}
                {isCurrentBranch && (
                  <span className="opacity-70 italic">{` (current)`}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
      <div className="flex justify-between items-center w-full gap-3">
        <BaseTextField
          placeholder="Branch Name"
          value={newBranchName}
          onChange={(e) => setNewBranchName(e.target.value)}
        />
        <Button
          className="flex-0 flex items-center gap-2 whitespace-nowrap"
          size="medium"
          variant="primary"
          onClick={() => onCreateBranch(newBranchName)}
        >
          <BiPlus className="w-5 h-auto opacity-70" /> Create New
        </Button>
      </div>
    </div>
  )
}
