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
  FieldsBuilder,
  BlockTemplate,
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from 'tinacms'
import { useContext } from 'react'
import { useInlineForm } from '../inline-form'
import { Button, IconButton } from '@tinacms/styles'
import { SettingsIcon } from '@tinacms/icons'
import { InlineFieldContext } from './inline-field-context'

interface BlockSettingsProps {
  template: BlockTemplate
}

export function BlockSettings({ template }: BlockSettingsProps) {
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
  const { name: blockName } = useContext(InlineFieldContext)

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
