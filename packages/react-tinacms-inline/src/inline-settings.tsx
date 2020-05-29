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
import { Field } from 'tinacms'
import {
  FieldsBuilder,
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from 'tinacms'
import { Button, IconButton } from '@tinacms/styles'
import { SettingsIcon } from '@tinacms/icons'

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
      <IconButton primary onClick={() => setOpen(p => !p)}>
        <SettingsIcon />
      </IconButton>
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

  let formFields = fields

  if (name) {
    formFields = fields.map((field: any) => ({
      ...field,
      name: `${name}.${field.name}`,
    }))
  }

  return (
    <Modal>
      <ModalPopup>
        <ModalHeader close={close}>Settings</ModalHeader>
        <ModalBody>
          <FieldsBuilder form={form} fields={formFields} />
        </ModalBody>
        <ModalActions>
          <Button onClick={close}>Cancel</Button>
        </ModalActions>
      </ModalPopup>
    </Modal>
  )
}
