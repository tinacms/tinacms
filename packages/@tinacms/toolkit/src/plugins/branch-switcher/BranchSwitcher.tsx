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
import { BranchSwitcherProps, Branch, BranchChangeEvent } from './types'
import styled from 'styled-components'
import { useBranchData } from './BranchData'
import { useEvent } from '../../packages/react-core/use-cms-event'
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

  // const handleCreateBranch = React.useCallback((value) => {
  //   setListState('loading')
  //   createBranch({
  //     branchName: value,
  //     baseBranch: currentBranch,
  //   }).then(async (createdBranchName) => {
  //     setCurrentBranch(createdBranchName)
  //     await refreshBranchList()
  //   })
  // }, [])

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
        <div style={{ margin: '2rem auto', textAlign: 'center' }}>
          <LoadingDots color={'var(--tina-color-primary)'} />
        </div>
      ) : (
        <>
          {listState === 'ready' ? (
            <SelectWrap>
              {/* <BranchSelector
        currentBranch={currentBranch}
        branchList={branchList}
        onCreateBranch={(newBranch) => {
          handleCreateBranch(newBranch)
        }}
        onChange={(branchName) => {
          setCurrentBranch(branchName)
        }}
      /> */}
              <SimpleBranchSelector
                branchList={branchList}
                currentBranch={currentBranch}
                onChange={(branchName) => {
                  setCurrentBranch(branchName)
                }}
              />
            </SelectWrap>
          ) : (
            <div style={{ margin: '2rem auto', textAlign: 'center' }}>
              An error occurred while retrieving the branch list. <br />
              <Button onClick={refreshBranchList}>Try again ⟳</Button>
            </div>
          )}
        </>
      )}
    </>
  )
}

const SimpleBranchSelector = ({ branchList, currentBranch, onChange }) => {
  return (
    <>
      <select
        onChange={(e) => {
          onChange(e.target.value)
        }}
        value={currentBranch}
        style={{
          margin: '2rem',
          fontSize: '1.2rem',
          minWidth: '10em',
          maxWidth: 'calc(100% - 4rem)',
          padding: '0.5rem',
        }}
      >
        {branchList.map((branch) => {
          return (
            <option
              value={branch.name}
              disabled={branch.name === currentBranch}
            >
              {branch.name}
            </option>
          )
        })}
      </select>
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
              <SelectableItem
                key={branch}
                onClick={() => onChange(branch.name)}
              >
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

const SelectWrap = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
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
