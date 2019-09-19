import * as React from 'react'
import styled from 'styled-components'
import { useCMS } from '@tinacms/react-tinacms'
import { SaveButton, CancelButton } from './FormView'
import { Modal, ModalHeader, ModalBody } from '../modalProvider'
import { ModalPopup } from '../modalPopup'
import { Button } from './Button'
import { FormBuilder, FieldsBuilder } from '@tinacms/form-builder'
import { useMemo } from 'react'
import { Form } from '@tinacms/core'

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
              <ModalHeader>{plugin.name}</ModalHeader>
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

const CreateButton = styled(Button)`
  width: 100%;
`

const ModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  border-radius: 0 0 ${p => p.theme.radius.big} ${p => p.theme.radius.big};
  overflow: hidden;
  ${Button} {
    border-radius: 0;
    flex: 1 0 auto;
  }
`
