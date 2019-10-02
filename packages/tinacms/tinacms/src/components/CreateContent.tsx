import * as React from 'react'
import styled from 'styled-components'
import { useCMS } from '@tinacms/react-tinacms'
import { SaveButton, CancelButton } from './FormView'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
} from './modals/ModalProvider'
import { ModalPopup } from './modals/ModalPopup'
import { Button } from './Button'
import { FormBuilder, FieldsBuilder } from '@tinacms/form-builder'
import { useMemo } from 'react'
import { Form } from '@tinacms/core'
import { CloseIcon } from '@tinacms/icons'
import { padding, color } from '@tinacms/styles'

export const CreateContentButton = ({ plugin }: any) => {
  let [open, setOpen] = React.useState(false)
  return (
    <>
      <CreateButton onClick={() => setOpen(p => !p)}>
        {plugin.name}
      </CreateButton>
      {open && <FormModal plugin={plugin} close={() => setOpen(false)} />}
    </>
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
                <FieldsBuilder form={form} fields={form.fields} />
              </ModalBody>
              <ModalActions>
                <CancelButton onClick={close}>Cancel</CancelButton>
                <SaveButton onClick={handleSubmit as any}>Create</SaveButton>
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

export const CreateButton = styled.button`
  position: relative;
  text-align: center;
  font-size: 0.75rem;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  width: 100%;
  background: none;
  cursor: pointer;
  outline: none;
  border: 0;
  transition: all 85ms ease-out;
  &:hover {
    color: ${color('primary')};
    background-color: #f6f6f9;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }
`
