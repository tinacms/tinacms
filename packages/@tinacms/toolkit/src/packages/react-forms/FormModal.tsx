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
import { Modal, ModalHeader, ModalBody, PopupModal } from '../react-modals'
import { FormBuilder } from '../form-builder'
import { useMemo } from 'react'
import { Form } from '../forms'
import { useCMS } from '../react-core'

export const FormModal = ({ plugin, close }: any) => {
  const cms = useCMS()
  const form: Form = useMemo(
    () =>
      new Form({
        id: 'create-form-id',
        label: 'create-form',
        fields: plugin.fields,
        actions: plugin.actions,
        buttons: plugin.buttons,
        initialValues: plugin.initialValues || {},
        reset: plugin.reset,
        onChange: plugin.onChange,
        onSubmit: async (values) => {
          await plugin.onSubmit(values, cms).then(() => {
            close()
          })
        },
      }),
    [close, cms, plugin]
  )

  return (
    <Modal id="content-creator-modal" onClick={(e) => e.stopPropagation()}>
      <PopupModal>
        <ModalHeader close={close}>{plugin.name}</ModalHeader>
        <ModalBody>
          <FormBuilder form={form} />
        </ModalBody>
      </PopupModal>
    </Modal>
  )
}
