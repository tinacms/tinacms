/**

*/

import * as React from 'react'
import { Modal, ModalHeader, ModalBody, PopupModal } from '../react-modals'
import { FormBuilder } from '../form-builder'
import { useMemo } from 'react'
import { Form } from '../forms'
import { useCMS } from '../react-core'

// Pretty sure this isn't used anymore
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
          <FormBuilder form={{ tinaForm: form }} />
        </ModalBody>
      </PopupModal>
    </Modal>
  )
}
