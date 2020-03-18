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
import styled from 'styled-components'

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
import { radius, color, Button, IconButton } from '@tinacms/styles'
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
  const { insert, move, remove, blocks, count } = useInlineBlocks()
  const { template } = useInlineBlock()
  const isFirst = index === 0
  const isLast = index === count - 1

  const removeBlock = () => remove(index)
  const moveBlockUp = () => move(index, index - 1)
  const moveBlockDown = () => move(index, index + 1)

  if (status === 'inactive') {
    return children
  }

  return (
    <BlockWrapper>
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

const BlockWrapper = styled.div`
  position: relative;

  &:focus-within {
    ${BlockMenu} {
      transform: translate3d(0, -100%, 0);
      opacity: 1;
    }

    &:after {
      opacity: 1;
    }
  }

  &:hover:not(:focus-within) {
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
`

interface AddBlockMenu {
  addBlock(data: any): void
  templates: BlockTemplate[]
}

function AddBlockMenu({ templates, addBlock }: AddBlockMenu) {
  return (
    <>
      {templates.map(template => {
        return (
          <IconButton
            key={template.label}
            primary
            onClick={() => {
              addBlock({
                _template: template.type,
                ...template.defaultItem,
              })
            }}
          >
            <AddIcon />
          </IconButton>
        )
      })}
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
