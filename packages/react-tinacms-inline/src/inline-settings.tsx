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
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from 'tinacms'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { Button } from '@tinacms/styles'
import { EditIcon } from '@tinacms/icons'
import { Field } from 'tinacms'
import { FormPortalProvider } from '@tinacms/react-forms'
import { BlockAction } from './blocks/inline-block-field-controls'
import { InlineFieldContext } from './inline-field-context'
import { useInlineForm } from './inline-form'

interface InlineSettingsProps {
  fields: Field[]
}

export function InlineSettings({ fields }: InlineSettingsProps) {
  const [open, setOpen] = React.useState(false)
  const noExtraFields = !(fields && fields.length)

  if (noExtraFields) {
    return null
  }

  return (
    <>
      <BlockAction onClick={() => setOpen(p => !p)}>
        <EditIcon />
      </BlockAction>
      {open && <SettingsModal fields={fields} close={() => setOpen(false)} />}
    </>
  )
}

interface SettingsModalProps {
  fields: Field[]
  close(): void
}

function SettingsModal({ fields, close }: SettingsModalProps) {
  const { form } = useInlineForm()
  const { name } = React.useContext(InlineFieldContext)
  const [initialValues] = React.useState(form.values)

  function handleCancel() {
    form.updateValues(initialValues)
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
    <Modal>
      <ModalPopup>
        <ModalHeader close={close}>Settings</ModalHeader>
        <ModalBody>
          <DragDropContext onDragEnd={moveArrayItem}>
            <Wrapper>
              <FormPortalProvider>
                <FieldsBuilder form={form} fields={formFields} />
              </FormPortalProvider>
            </Wrapper>
          </DragDropContext>
        </ModalBody>
        <ModalActions>
          {form.values !== initialValues && (
            <Button onClick={close}>Confirm</Button>
          )}
          <Button onClick={handleCancel}>Cancel</Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}

const Wrapper = styled.div`
  display: block;
  margin: 0 auto;
  width: 100%;
`
