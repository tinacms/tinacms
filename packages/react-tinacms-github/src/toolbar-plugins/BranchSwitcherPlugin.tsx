/**

Copyright 2019 Forestry.io Inc

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
import {
  Form,
  Input,
  useCMS,
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
  FormBuilder,
  FieldsBuilder,
} from 'tinacms'
import { AddIcon, ChevronDownIcon, LockIcon } from '@tinacms/icons'
import { Button } from '@tinacms/styles'
import { Dismissible } from 'react-dismissible'
import styled, { css } from 'styled-components'
import { GithubClient, Branch } from '../github-client'
import { LoadingDots } from '@tinacms/react-forms'

interface BranchSwitcherProps {
  onBranchChange?(branch: string): void
}

const BranchSwitcher = ({ onBranchChange }: BranchSwitcherProps) => {
  const cms = useCMS()
  const github: GithubClient = cms.api.github

  const [open, setOpen] = React.useState(false)
  const [confirmSwitchProps, setConfirmSwitchProps] = React.useState<any>()
  const [createBranchProps, setCreateBranchProps] = React.useState<any>()
  const [filterValue, setFilterValue] = React.useState('')
  const selectListRef = React.useRef<HTMLElement>()

  const [branchStatus, setBranchStatus] = React.useState<
    'pending' | 'loaded' | 'error'
  >('pending')
  const [branches, setBranches] = React.useState<Branch[]>([])

  const updateBranchList = React.useCallback(() => {
    github
      .getBranchList()
      .then(branches => {
        setBranches(branches)
        setBranchStatus('loaded')
      })
      .catch(() => {
        setBranchStatus('error')
      })
  }, [github, setBranches, setBranchStatus])

  React.useEffect(() => {
    updateBranchList()
    cms.events.subscribe('github:branch:create', updateBranchList)
  }, [])

  const closeDropdown = () => {
    setOpen(false)
    setFilterValue('')
    if (selectListRef.current) {
      selectListRef.current.scrollTop = 0
    }
  }

  const openCreateBranchModal = () => {
    setCreateBranchProps({ name: filterValue })
    closeDropdown()
  }

  const filteredBranches = branches.filter(option => {
    return option.name.includes(filterValue)
  })

  return (
    <>
      <SelectWrapper>
        <SelectBox onClick={() => setOpen(!open)} open={open}>
          <SelectLabel>Branch</SelectLabel>
          <SelectCurrent>{github.branchName}</SelectCurrent>
          <ChevronDownIcon />
        </SelectBox>
        <SelectDropdown open={open}>
          <Dismissible click escape disabled={!open} onDismiss={closeDropdown}>
            <DropdownHeader>
              <SelectFilter
                placeholder="Filter"
                onChange={event => setFilterValue(event.target.value)}
                value={filterValue}
              />
            </DropdownHeader>
            <SelectList ref={selectListRef as any}>
              {branchStatus === 'pending' && (
                <SelectLoadingState>
                  <LoadingDots color="var(--tina-color-primary)" />
                </SelectLoadingState>
              )}
              {branchStatus === 'loaded' && (
                <>
                  {filteredBranches.map(option => (
                    <SelectOption
                      key={option.name}
                      active={option.name === github.branchName}
                      onClick={() => {
                        setConfirmSwitchProps(option)
                        closeDropdown()
                      }}
                    >
                      {option.protected && <LockIcon />} {option.name}
                    </SelectOption>
                  ))}
                  {filteredBranches.length === 0 && (
                    <SelectEmptyState>No branches to display.</SelectEmptyState>
                  )}
                </>
              )}
              {branchStatus === 'error' && (
                <SelectEmptyState>
                  We had trouble loading branches. Please refresh to try again.
                </SelectEmptyState>
              )}
            </SelectList>
            <DropdownActions>
              <CreateButton onClick={openCreateBranchModal}>
                <AddIcon /> New Branch
              </CreateButton>
            </DropdownActions>
          </Dismissible>
        </SelectDropdown>
      </SelectWrapper>
      {createBranchProps && (
        <CreateBranchModal
          current={github.branchName}
          name={createBranchProps.name}
          onBranchChange={(name: string) => {
            if (onBranchChange) {
              onBranchChange(name)
            }
            setCreateBranchProps(null)
          }}
          close={() => {
            setCreateBranchProps(null)
          }}
        />
      )}
      {confirmSwitchProps && (
        <ConfirmSwitchBranchModal
          name={confirmSwitchProps.name}
          onBranchChange={() => {
            cms.alerts.info('Switched to branch ' + confirmSwitchProps.name)
            github.setWorkingBranch(confirmSwitchProps.name)
            closeDropdown()
            if (onBranchChange) {
              onBranchChange(confirmSwitchProps.name)
            }
            setConfirmSwitchProps(null)
            setCreateBranchProps(null)
            cms.events.dispatch({
              type: 'github:branch:checkout',
              branchName: confirmSwitchProps.name,
            })
          }}
          close={() => {
            setConfirmSwitchProps(null)
          }}
        />
      )}
    </>
  )
}

const CreateBranchModal = ({ current, name, onBranchChange, close }: any) => {
  const cms = useCMS()

  const form: Form = React.useMemo(
    () =>
      new Form({
        label: 'create-branch',
        id: 'create-branch-id',
        initialValues: {
          name,
        },
        fields: [{ label: 'Branch Name', name: 'name', component: 'text' }],
        async onSubmit({ name }) {
          try {
            await cms.api.github.createBranch(name)
            cms.events.dispatch({
              type: 'github:branch:create',
              branchName: name,
            })
            cms.api.github.setWorkingBranch(name)
            cms.events.dispatch({
              type: 'github:branch:checkout',
              branchName: name,
            })
            if (onBranchChange) {
              onBranchChange(name)
            }
          } catch (error) {
            cms.events.dispatch({ type: 'github:error', error })
          }
        },
      }),
    [cms]
  )

  return (
    <Modal>
      <FormBuilder form={form}>
        {({ handleSubmit }) => {
          return (
            <ModalPopup>
              <ModalHeader close={close}>Create Branch</ModalHeader>
              <ModalBody
                onKeyPress={e =>
                  e.charCode === 13 ? (handleSubmit() as any) : null
                }
              >
                <FieldsBuilder form={form} fields={form.fields} />
                <ModalText>
                  <p>
                    Create branch&nbsp;<BranchName>{name}</BranchName>&nbsp;from
                    '{current}'
                  </p>
                </ModalText>
              </ModalBody>
              <ModalActions>
                <Button onClick={close}>Cancel</Button>
                <Button onClick={handleSubmit} primary>
                  Create
                </Button>
              </ModalActions>
            </ModalPopup>
          )
        }}
      </FormBuilder>
    </Modal>
  )
}

const ConfirmSwitchBranchModal = ({ name, onBranchChange, close }: any) => {
  return (
    <Modal>
      <ModalPopup>
        <ModalHeader close={close}>Switch Branch</ModalHeader>
        <ModalBody
          padded={true}
          onKeyPress={e =>
            e.charCode === 13 ? (onBranchChange() as any) : null
          }
        >
          <p>
            Are you sure you want to switch to branch{' '}
            <BranchName>{name}</BranchName>?
          </p>
        </ModalBody>
        <ModalActions>
          <Button onClick={close}>Cancel</Button>
          <Button onClick={onBranchChange} primary>
            Switch Branch
          </Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}

const ModalText = styled.div`
  padding: 0 var(--tina-padding-big) var(--tina-padding-big)
    var(--tina-padding-big);
`

const SelectFilter = styled(Input)`
  height: 36px;
  flex: 0 1 auto;

  ::placeholder {
    color: var(--tina-color-grey-4);
  }
`

const CreateButton = styled(Button)`
  display: flex;
  align-items: center;
  height: 36px;

  svg {
    width: 24px;
    margin-right: 4px;
    opacity: 0.7;
  }
`

const BranchName = styled.span`
  font-weight: bold;
  color: var(--tina-color-primary);
`

const DropdownActions = styled.div`
  background-color: var(--tina-color-grey-1);
  border-top: 1px solid var(--tina-color-grey-2);
  padding: var(--tina-padding-small);
`

const DropdownHeader = styled.div`
  padding: var(--tina-padding-small);
  border-bottom: 1px solid var(--tina-color-grey-2);
`

const SelectEmptyState = styled.div`
  display: block;
  border: none;
  outline: none;
  padding: var(--tina-padding-small);
  background: transparent;
  color: var(--tina-color-grey-4);
  text-align: left;
  font-size: var(--tina-font-size-2);
  line-height: 1.4;
  width: 100%;
  transition: all 150ms ease-out;
  flex: 0 0 auto;
`

const SelectLoadingState = styled.div`
  display: flex;
  border: none;
  outline: none;
  padding: var(--tina-padding-small);
  background: transparent;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex: 0 0 auto;
`

export interface SelectOptionProps {
  active?: boolean
}

const SelectOption = styled.button<SelectOptionProps>`
  display: lock;
  border: none;
  outline: none;
  padding: 4px var(--tina-padding-small);
  background: transparent;
  color: var(--tina-color-grey-6);
  text-align: left;
  font-size: var(--tina-font-size-2);
  line-height: 1.2;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;
  transition: all 150ms ease-out;
  text-overflow: ellipsis;
  max-width: 100%;
  overflow: hidden;
  flex: 0 0 auto;

  svg {
    width: 20px;
    height: auto;
    margin: -4px -4px -4px -4px;
    fill: currentColor;
    opacity: 0.7;
  }

  :first-child {
    padding-top: 8px;
  }

  :last-child {
    padding-bottom: 8px;
  }

  :hover {
    color: var(--tina-color-primary);
    background-color: var(--tina-color-grey-1);
  }

  ${p =>
    p.active &&
    css`
      font-weight: bold;
      color: var(--tina-color-primary);
      background-color: var(--tina-color-grey-1);
      pointer-events: none;
    `};
`

const SelectList = styled.div`
  min-width: 200px;
  max-height: 170px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
`

const SelectWrapper = styled.div`
  position: relative;
`

export interface SelectDropdownProps {
  open?: boolean
}

const SelectDropdown = styled.div<SelectDropdownProps>`
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translate3d(-50%, calc(100% - 16px), 0) scale3d(0.5, 0.5, 1);
  border-radius: var(--tina-radius-small);
  border: 1px solid var(--tina-color-grey-2);
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  transform-origin: 50% 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  opacity: 0;
  width: 350px;

  &:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate3d(-50%, -100%, 0);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid var(--tina-color-grey-2);
  }

  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 1px;
    left: 50%;
    transform: translate3d(-50%, -100%, 0);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid white;
  }

  ${p =>
    p.open &&
    css`
      opacity: 1;
      pointer-events: auto;
      transform: translate3d(-50%, 100%, 0) scale3d(1, 1, 1);
    `};
`

export interface SelectBoxProps {
  open: boolean
}

const SelectBox = styled.button<SelectBoxProps>`
  border-radius: var(--tina-radius-small);
  border: 1px solid var(--tina-color-grey-2);
  background-color: white;
  padding: 5px 42px 5px var(--tina-padding-small);
  position: relative;
  outline: none;
  cursor: pointer;
  min-width: 140px;
  transition: all 150ms ease-out;

  :hover {
    background-color: var(--tina-color-grey-1);
  }

  svg {
    fill: var(--tina-color-primary);
    position: absolute;
    top: 50%;
    right: 8px;
    transform-origin: 50% 50%;
    transform: translate3d(0, -50%, 0);
    transition: all 150ms ease-out;
    width: 24px;
    height: auto;
  }

  ${p =>
    p.open &&
    css`
      background-color: var(--tina-color-grey-1);
      box-shadow: inset 0px 2px 3px rgba(0, 0, 0, 0.06);

      ${SelectLabel} {
        color: var(--tina-color-primary);
      }

      svg {
        transform: translate3d(0, -50%, 0) rotate(180deg);
        fill: var(--tina-color-grey-4);
      }
    `};
`

const SelectLabel = styled.span`
  color: var(--tina-color-grey-8);
  display: block;
  letter-spacing: 0.01em;
  line-height: 1;
  font-size: var(--tina-font-size-1);
  font-weight: 600;
  text-align: left;
  transition: all 150ms ease-out;
`

const SelectCurrent = styled.span`
  color: var(--tina-color-grey-6);
  display: block;
  text-align: left;
  line-height: 20px;
  font-size: var(--tina-font-size-3);
  text-overflow: ellipsis;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
`

export const BranchSwitcherPlugin = {
  __type: 'toolbar:widget',
  name: 'branch-switcher',
  weight: 1,
  component: BranchSwitcher,
}
