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
import styled, { StyledComponent } from 'styled-components'

export const BranchSwitcher = ({
  currentBranch,
  setCurrentBranch,
  listBranches,
  createBranch,
}: BranchSwitcherProps) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [branchList, setBranchList] = React.useState([])

  const handleCreateBranch = React.useCallback((value) => {
    setIsLoading(true)
    createBranch(value)
      .then(async (createdBranchName) => {
        setCurrentBranch(createdBranchName)
        await refreshBranchList()
      })
      .finally(() => setIsLoading(false))
  }, [])

  const refreshBranchList = React.useCallback(async () => {
    setIsLoading(true)
    await listBranches()
      .then((data: Branch[]) => {
        setBranchList(data)
      })
      .finally(() => setIsLoading(false))
  }, [])

  // load branch list
  React.useEffect(() => {
    refreshBranchList()
  }, [])

  return (
    <SelectWrap isLoading={isLoading}>
      <h3>Select Branch</h3>
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
  return (
    <SelectorColumn>
      <input value={newBranch} onChange={(e) => setNewBranch(e.target.value)} />
      <hr />
      {!branchExists && newBranch ? (
        <SelectableItem onClick={() => onCreateBranch(newBranch)}>
          Create New Branch `{newBranch}`...
        </SelectableItem>
      ) : (
        ''
      )}
      <hr />
      <ListWrap>
        {branchList
          .filter((branch) => !newBranch || branch.name.includes(newBranch))
          .map((branch) => {
            return (
              <SelectableItem onClick={() => onChange(branch.name)}>
                {branch.name}
                {branch.name === currentBranch && (
                  <span style={{ fontStyle: 'italic', opacity: 0.5 }}>
                    (current)
                  </span>
                )}
              </SelectableItem>
            )
          })}
      </ListWrap>
    </SelectorColumn>
  )
}

const SelectWrap: StyledComponent<
  'div',
  any,
  { isLoading: boolean }
> = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  opacity: ${(props: any) => (props.isLoading ? '0.5' : '1')};
  pointer-events: ${(props: any) => (props.isLoading ? 'none' : 'initial')};
`

const SelectorColumn = styled.div`
  width: 100%;
  padding: 1rem;
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
  border: 1px solid magenta;
  max-height: 70vh;
  overflow-y: auto;
`
