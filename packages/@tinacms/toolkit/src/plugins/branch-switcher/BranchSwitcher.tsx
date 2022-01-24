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
import styled from 'styled-components'
import { useBranchData } from './BranchData'
import { Button } from '../../packages/styles'
import { LoadingDots } from '../../packages/form-builder'

type ListState = 'loading' | 'ready' | 'error'

export const BranchSwitcher = ({
  listBranches,
  createBranch,
}: BranchSwitcherProps) => {
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
    <>
      {listState === 'loading' ? (
        <div style={{ margin: '32px auto', textAlign: 'center' }}>
          <LoadingDots color={'var(--tina-color-primary)'} />
        </div>
      ) : (
        <>
          {listState === 'ready' ? (
            <SelectWrap>
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
            </SelectWrap>
          ) : (
            <>
              <p className="text-base mt-8 mx-8 mb-4 text-center">
                An error occurred while retrieving the branch list.
              </p>
              <Button className="mx-auto" onClick={refreshBranchList}>
                Try again ⟳
              </Button>
            </>
          )}
        </>
      )}
    </>
  )
}

const BranchSelector = ({
  branchList,
  currentBranch,
  onCreateBranch,
  onChange,
}) => {
  const [newBranch, setNewBranch] = React.useState('')
  const branchExists = branchList.find((branch) => branch.name === newBranch)
  const filteredBranchList = branchList.filter(
    (branch) => !newBranch || branch.name.includes(newBranch)
  )
  return (
    <SelectorColumn>
      <input
        placeholder="Type the name of a branch to filter or create"
        value={newBranch}
        style={{ padding: '0.5rem' }}
        onChange={(e) => setNewBranch(e.target.value)}
      />

      {!branchExists && newBranch ? (
        <>
          <Spacer />
          <Button
            size="small"
            variant="primary"
            onClick={() => onCreateBranch(newBranch)}
          >
            Create New Branch `{newBranch}`...
          </Button>
        </>
      ) : (
        ''
      )}
      {filteredBranchList.length > 0 && (
        <>
          <Spacer />
          <ListWrap>
            {filteredBranchList.map((branch) => {
              const isCurrentBranch = branch.name === currentBranch
              return (
                <SelectableItem
                  key={branch}
                  onClick={() => onChange(branch.name)}
                  style={
                    isCurrentBranch
                      ? {
                          opacity: 0.6,
                          pointerEvents: 'none',
                          fontStyle: 'italic',
                        }
                      : {}
                  }
                >
                  {branch.name}
                  {isCurrentBranch && '(current)'}
                </SelectableItem>
              )
            })}
          </ListWrap>
        </>
      )}
    </SelectorColumn>
  )
}

const SelectWrap = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
`

const SelectorColumn = styled.div`
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
`

const SelectableItem = styled.div`
  cursor: pointer;
  &:hover {
    background-color: aquamarine;
  }
`
const ListWrap = styled.div`
  max-height: 70vh;
  overflow: auto;
  white-space: nowrap;
  background-color: #fff;
  padding: 0.5rem;
  box-shadow: inset 0px 0px 5px 0px rgb(0 0 0 / 20%);
`
const Spacer = styled.div`
  height: 0;
  width: 100%;
  margin: 0.5rem 0;
`
