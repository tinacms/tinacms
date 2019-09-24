import * as React from 'react'
import styled from 'styled-components'
import { useCMS } from '@tinacms/react-tinacms'
import { SaveButton, CancelButton } from './FormView'
import { Modal, ModalHeader, ModalBody, ModalActions } from './modalProvider'
import { ModalPopup } from './modalPopup'
import { Button } from './Button'
import { FormBuilder, FieldsBuilder } from '@tinacms/form-builder'
import { useMemo } from 'react'
import { Form } from '@tinacms/core'
import { CloseIcon } from '@tinacms/icons'
import { padding, color } from '@tinacms/styles'

export const CreateContentButton = ({ plugin }: any) => {
  let [open, setOpen] = React.useState(false)
  return (
    <div>
      <CreateButton onClick={() => setOpen(p => !p)}>
        {plugin.name}
      </CreateButton>
      {open && <FormModal plugin={plugin} close={() => setOpen(false)} />}
    </div>
  )
}

const FormModal = ({ plugin, close }: any) => {
  let cms = useCMS()
  let form: Form = useMemo(
    () =>
      new Form({
        label: 'create-form',
        id: 'create-form-id',
        actions: [],
        fields: plugin.fields,
        onSubmit(values) {
          plugin.onSubmit(values, cms).then(() => {
            close()
          })
        },
      }),
    []
  )
  return (
    <Modal>
      <FormBuilder form={form}>
        {({ handleSubmit }) => {
          return (
            <ModalPopup>
              <ModalHeader>
                {plugin.name}
                <CloseButton onClick={close}>
                  <CloseIcon />
                </CloseButton>
              </ModalHeader>
              <ModalBody>
                <FieldsBuilder form={form} />
              </ModalBody>
              <ModalActions>
                <SaveButton onClick={handleSubmit as any}>Create</SaveButton>
                <CancelButton onClick={close}>Cancel</CancelButton>
              </ModalActions>
            </ModalPopup>
          )
        }}
      </FormBuilder>
    </Modal>
  )
}

const CloseButton = styled.div`
  fill: ${color('medium')};
  cursor: pointer;
  transition: fill 85ms ease-out;
  &:hover {
    fill: ${color('dark')};
  }
`

const CreateButton = styled(Button)`
  width: 100%;
`
