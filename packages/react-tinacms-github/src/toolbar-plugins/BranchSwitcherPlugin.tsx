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
import { AddIcon, ChevronDownIcon } from '@tinacms/icons'
import { Button } from '@tinacms/styles'
import { Dismissible } from 'react-dismissible'
import styled, { css } from 'styled-components'
import { GithubClient } from '../github-client'

interface Branch {
  name: string
  locked: boolean
}

const testBranches: Branch[] = [
  { name: 'master', locked: true },
  { name: 'release-notes', locked: false },
]

interface BranchSwitcherProps {
  onBranchChange?(branch: string): void
}

const BranchSwitcher = ({ onBranchChange }: BranchSwitcherProps) => {
  const cms = useCMS()
  const github: GithubClient = cms.api.github
  const [open, setOpen] = React.useState(false)
  const [createBranchOpen, setCreateBranchOpen] = React.useState(false)
  const [filterValue, setFilterValue] = React.useState('')
  const selectListRef = React.useRef<HTMLElement>()
  const data = testBranches
  const currentBranch = github.branchName

  const closeDropdown = () => {
    setOpen(false)
    setFilterValue('')
    if (selectListRef.current) {
      selectListRef.current.scrollTop = 0
    }
  }

  const openCreateBranchModal = () => {
    closeDropdown()
    setCreateBranchOpen(true)
  }

  return (
    <>
      <SelectWrapper>
        <SelectBox onClick={() => setOpen(!open)} open={open}>
          <SelectLabel>Branch</SelectLabel>
          <SelectCurrent>{currentBranch}</SelectCurrent>
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
              {data
                .filter(option => {
                  return option.name.includes(filterValue)
                })
                .map(option => (
                  <SelectOption
                    key={option.name}
                    active={option.name === currentBranch}
                    onClick={() => {
                      cms.alerts.info('Switched to branch ' + option.name)
                      github.setWorkingBranch(option.name)
                      closeDropdown()
                      if (onBranchChange) {
                        onBranchChange(option.name)
                      }
                    }}
                  >
                    {option.locked && <LockedIcon />} {option.name}
                  </SelectOption>
                ))}
              {data.filter(option => {
                return option.name.includes(filterValue)
              }).length === 0 && (
                <SelectEmptyState>No branches to display.</SelectEmptyState>
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
      {createBranchOpen && (
        <CreateBranchModal
          close={() => {
            setCreateBranchOpen(false)
          }}
        />
      )}
    </>
  )
}

const CreateBranchModal = ({ close }: any) => {
  const cms = useCMS()

  const branchOptions = testBranches.map(function(branch) {
    return branch.name
  })

  const handleSubmit = () => {
    return null
  }

  const form: Form = React.useMemo(
    () =>
      new Form({
        label: 'create-branch',
        id: 'create-branch-id',
        actions: [],
        fields: [
          {
            label: 'Base Branch',
            name: 'base-branch',
            component: 'select',
            //@ts-ignore
            options: branchOptions,
          },
          { label: 'Branch Name', name: 'branch-name', component: 'text' },
        ],
        onSubmit() {
          handleSubmit()
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

const SelectFilter = styled(Input)`
  height: 36px;
  flex: 0 1 auto;

  ::placeholder {
    color: var(--tina-color-grey-3);
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
  display: lock;
  border: none;
  outline: none;
  padding: var(--tina-padding-small);
  background: transparent;
  color: var(--tina-color-grey-4);
  text-align: left;
  line-height: 17px;
  white-space: nowrap;
  width: 100%;
  transition: all 150ms ease-out;
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
  line-height: 17px;
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
  text-overflow: ellipsis;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
`

export const LockedIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="inherit"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M25 16.5C25 15.3419 23.9909 14.4 22.75 14.4H21.625V10.25C21.625 7.35515 19.1016 5 16 5C12.8984 5 10.375 7.35515 10.375 10.25V14.4H9.25C8.00912 14.4 7 15.3419 7 16.5V23.9C7 25.0581 8.00912 26 9.25 26H22.75C23.9909 26 25 25.0581 25 23.9V16.5ZM12.625 10.25C12.625 8.5133 14.1392 7.1 16 7.1C17.8608 7.1 19.375 8.5133 19.375 10.25V14.4H12.625V10.25Z"
      fill="inherit"
    />
  </svg>
)

export const BranchSwitcherPlugin = {
  __type: 'toolbar:widget',
  name: 'branch-switcher',
  weight: 1,
  component: BranchSwitcher,
}
