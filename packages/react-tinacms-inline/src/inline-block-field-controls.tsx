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
  BlockTemplate,
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from 'tinacms'
import { Button } from '@tinacms/styles'

import { useInlineBlock, useInlineBlocks } from './inline-field-blocks'
import { useInlineForm } from './inline-form'
import { FieldsBuilder } from 'tinacms'
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
      <AddBlockMenu
        addBlock={block => insert(index + 1, block)}
        templates={Object.entries(blocks).map(([, block]) => block.template)}
      />
      <button onClick={removeBlock}>Remove</button>
      <button onClick={moveBlockUp} disabled={isFirst}>
        Up
      </button>
      <button onClick={moveBlockDown} disabled={isLast}>
        Down
      </button>
      <BlockSettings template={template} />

      {children}
    </BlockWrapper>
  )
}

const BlockWrapper = styled.div`
  border: 1px solid green;
  max-width: 500px;
  margin: 16px;
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
          <button
            key={template.label}
            onClick={() => {
              addBlock({
                _template: template.type,
                ...template.defaultItem,
              })
            }}
          >
            Add {template.label}
          </button>
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
      <button onClick={() => setOpen(p => !p)}>Settings</button>
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
