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
import styled, { css } from 'styled-components'

import {
  FieldsBuilder,
  BlockTemplate,
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from 'tinacms'
import { useInlineBlock, useInlineBlocks } from './inline-field-blocks'
import { useInlineForm } from '../inline-form'
import {
  radius,
  color,
  Button,
  IconButton,
  shadow,
  font,
} from '@tinacms/styles'
import {
  AddIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  SettingsIcon,
} from '@tinacms/icons'

/**
 *
 * TODO: I think this should be defined in `tinacms` and not with the rest of the inline stuff?
 */
export interface BlocksControlsProps {
  children: any
  index: number
}

export function BlocksControls({ children, index }: BlocksControlsProps) {
  const { status } = useInlineForm()
  const {
    insert,
    move,
    remove,
    blocks,
    count,
    activeBlock,
    setActiveBlock,
  } = useInlineBlocks()
  const { template } = useInlineBlock()
  const isFirst = index === 0
  const isLast = index === count - 1

  const removeBlock = () => remove(index)

  if (status === 'inactive') {
    return children
  }

  const moveBlockUp = (event: React.MouseEvent) => {
    event.stopPropagation()
    move(index, index - 1)
  }

  const moveBlockDown = (event: React.MouseEvent) => {
    event.stopPropagation()
    move(index, index + 1)
  }

  const clickHandler = (event: React.MouseEvent) => {
    event.preventDefault()
    setActiveBlock(index)
  }

  return (
    <BlockWrapper active={activeBlock === index} onClick={clickHandler}>
      <BlockMenu>
        <AddBlockMenu
          addBlock={block => insert(index + 1, block)}
          templates={Object.entries(blocks).map(([, block]) => block.template)}
        />
        <IconButton primary onClick={moveBlockUp} disabled={isFirst}>
          <ChevronUpIcon />
        </IconButton>
        <IconButton primary onClick={moveBlockDown} disabled={isLast}>
          <ChevronDownIcon />
        </IconButton>
        <IconButton primary onClick={removeBlock}>
          <TrashIcon />
        </IconButton>
        <BlockSettings template={template} />
      </BlockMenu>
      {children}
    </BlockWrapper>
  )
}

const BlockMenu = styled.div`
  position: absolute;
  top: -1.5rem;
  right: -1rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  opacity: 0;
  transform: translate3d(0, 0, 0);
  transition: all 120ms ease-out;

  ${Button} {
    height: 34px;
    margin-left: 0.5rem;
  }

  ${IconButton} {
    width: 34px;
    height: 34px;
    margin-left: 0.5rem;
  }
`

export interface BlockWrapperProps {
  active: boolean
}

const BlockWrapper = styled.div<BlockWrapperProps>`
  position: relative;

  &:hover {
    &:after {
      opacity: 0.3;
    }
  }

  &:after {
    content: '';
    display: block;
    position: absolute;
    left: -16px;
    top: -16px;
    width: calc(100% + 2rem);
    height: calc(100% + 2rem);
    border: 3px solid ${color.primary()};
    border-radius: ${radius()};
    opacity: 0;
    pointer-events: none;
    z-index: 1000;
    transition: all 150ms ease-out;
  }

  ${p =>
    p.active &&
    css`
      ${BlockMenu} {
        transform: translate3d(0, -100%, 0);
        opacity: 1;
      }

      &:after {
        opacity: 1 !important;
      }
    `};
`

interface AddBlockMenuProps {
  addBlock(data: any): void
  templates: BlockTemplate[]
}

export function AddBlockMenu({ templates, addBlock }: AddBlockMenuProps) {
  const [isOpen, setOpen] = React.useState(false)

  const handleOpenMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    setOpen(isOpen => !isOpen)
  }

  React.useEffect(() => {
    const setInactive = () => setOpen(false)
    document.addEventListener('mouseup', setInactive, false)
    return () => document.removeEventListener('mouseup', setInactive)
  }, [])

  templates = templates || []

  return (
    <>
      <AddBlockButton onClick={handleOpenMenu} isOpen={isOpen} primary>
        <AddIcon /> Add Block
      </AddBlockButton>
      <BlocksMenu isOpen={isOpen}>
        {templates.map((template: BlockTemplate) => (
          <BlockOption
            key={template.label}
            onClick={() => {
              addBlock({
                _template: template.type,
                ...template.defaultItem,
              })
            }}
          >
            {template.label}
          </BlockOption>
        ))}
      </BlocksMenu>
    </>
  )
}

interface BlockSettingsProps {
  template: BlockTemplate
}

function BlockSettings({ template }: BlockSettingsProps) {
  const [open, setOpen] = React.useState(false)
  const noExtraFields = !(template.fields && template.fields.length)

  if (noExtraFields) {
    return null
  }
  return (
    <>
      <IconButton primary onClick={() => setOpen(p => !p)}>
        <SettingsIcon />
      </IconButton>
      {open && (
        <BlockSettingsModal template={template} close={() => setOpen(false)} />
      )}
    </>
  )
}

function BlockSettingsModal({ template, close }: any) {
  const { form } = useInlineForm()
  const { name: blockName } = useInlineBlock()

  const fields = template.fields.map((field: any) => ({
    ...field,
    name: `${blockName}.${field.name}`,
  }))

  return (
    <Modal>
      <ModalPopup>
        <ModalHeader close={close}>Settings</ModalHeader>
        <ModalBody>
          <FieldsBuilder form={form} fields={fields} />
        </ModalBody>
        <ModalActions>
          <Button onClick={close}>Cancel</Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}

interface AddMenuProps {
  isOpen?: boolean
  active?: boolean
}

const AddBlockButton = styled(Button)<AddMenuProps>`
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  margin: 0 auto;

  &:focus {
    outline: none !important;
  }

  svg {
    height: 70%;
    width: auto;
    margin-right: 0.5em;
    transition: all 150ms ease-out;
  }

  ${props =>
    props.open &&
    css`
      svg {
        transform: rotate(45deg);
      }
    `};
`

const BlocksMenu = styled.div<AddMenuProps>`
  min-width: 192px;
  border-radius: ${radius()};
  border: 1px solid ${color.grey(2)};
  display: block;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate3d(-50%, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 50% 0;
  box-shadow: ${shadow('big')};
  background-color: white;
  overflow: hidden;
  z-index: 950;
  ${props =>
    props.isOpen &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(-50%, 48px, 0) scale3d(1, 1, 1);
    `};
`

const BlockOption = styled.button`
  font-family: 'Inter', sans-serif;
  position: relative;
  text-align: center;
  font-size: ${font.size(0)};
  padding: 0 12px;
  height: 40px;
  font-weight: 500;
  width: 100%;
  background: none;
  cursor: pointer;
  outline: none;
  border: 0;
  transition: all 85ms ease-out;
  &:hover {
    color: ${color.primary()};
    background-color: #f6f6f9;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }
`
