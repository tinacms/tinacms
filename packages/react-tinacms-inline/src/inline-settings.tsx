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
import styled from 'styled-components'

import {
  FieldsBuilder,
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from '@einsteinindustries/tinacms'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { Button } from '@einsteinindustries/tinacms-styles'
import { EditIcon } from '@einsteinindustries/tinacms-icons'
import { Field } from '@einsteinindustries/tinacms'
import { FormPortalProvider } from '@einsteinindustries/tinacms-form-builder'
import { BlockAction } from './blocks/inline-block-field-controls'
import { InlineFieldContext } from './inline-field-context'
import { useInlineForm } from './inline-form'

interface InlineSettingsProps {
  fields: Field[]
}

export function InlineSettings({ fields }: InlineSettingsProps) {
  const [open, setOpen] = React.useState(false)
  const noExtraFields = !(fields && fields.length)

  const toggleOpen = (event: any) => {
    event.stopPropagation()
    event.preventDefault()
    setOpen(!open)
  }

  if (noExtraFields) {
    return null
  }

  return (
    <>
      <BlockAction onClick={toggleOpen}>
        <EditIcon />
      </BlockAction>
      {open && <SettingsModal fields={fields} close={() => setOpen(false)} />}
    </>
  )
}

export interface SettingsModalProps {
  title?: string
  fields: Field[]
  close(): void
}

export function SettingsModal({
  title = 'Settings',
  fields,
  close,
}: SettingsModalProps) {
  const { form } = useInlineForm()
  const { name } = React.useContext(InlineFieldContext)
  const [initialValues] = React.useState(form.values)

  function handleCancel() {
    form.updateValues(initialValues)
    close()
  }

  function handleClose(event: any) {
    event.stopPropagation()
    event.preventDefault()
    close()
  }

  let formFields = fields

  if (name) {
    formFields = fields.map((field: any) => ({
      ...field,
      name: `${name}.${field.name}`,
    }))
  }
  const moveArrayItem = React.useCallback(
    (result: DropResult) => {
      if (!result.destination || !form) return
      const name = result.type
      form.mutators.move(name, result.source.index, result.destination.index)
    },
    [form]
  )
  return (
    <Modal id="tinacms-inline-settings" onClick={e => e.stopPropagation()}>
      <ModalPopup>
        <ModalHeader close={handleCancel}>{title}</ModalHeader>
        <ModalBody>
          <DragDropContext onDragEnd={moveArrayItem}>
            <FormBody>
              <Wrapper>
                <FieldsBuilder form={form} fields={formFields} />
              </Wrapper>
            </FormBody>
          </DragDropContext>
        </ModalBody>
        <ModalActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            onClick={handleClose}
            disabled={form.values === initialValues}
            primary
          >
            Confirm
          </Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}

const FormBody = styled(FormPortalProvider)`
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
  border-top: 1px solid var(--tina-color-grey-2);
  background-color: #f6f6f9;
`

const Wrapper = styled.div`
  display: block;
  margin: 0 auto;
  width: 100%;
`
