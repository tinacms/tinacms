import * as React from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody,
  PopupModal,
} from '@toolkit/react-modals'
import { FormBuilder } from '@toolkit/form-builder'
import { useMemo } from 'react'
import { Form } from '@toolkit/forms'
import { useCMS } from '@toolkit/react-core'

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
