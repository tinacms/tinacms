import * as React from 'react'
import styled, { css } from 'styled-components'
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
import { CloseIcon, AddIcon } from '@tinacms/icons'
import { padding, color } from '@tinacms/styles'
import { Dismissible } from 'react-dismissible'
import { useFrameContext } from './SyledFrame'
import { useTina } from '../hooks/use-tina'

export const CreateContentMenu = () => {
  const cms = useTina()
  const frame = useFrameContext()
  let [visible, setVisible] = React.useState(false)

  return (
    <ContentMenuWrapper>
      <PlusButton onClick={() => setVisible(true)} open={visible}>
        <AddIcon />
      </PlusButton>
      <ContentMenu open={visible}>
        <Dismissible
          click
          escape
          onDismiss={() => setVisible(false)}
          document={frame.document}
          disabled={!visible}
        >
          {cms.plugins.all('content-button').map(plugin => (
            <CreateContentButton
              plugin={plugin}
              key={plugin.name}
              onClick={() => {
                setVisible(false)
              }}
            />
          ))}
        </Dismissible>
      </ContentMenu>
    </ContentMenuWrapper>
  )
}

const CreateContentButton = ({ plugin, onClick }: any) => {
  let [open, setOpen] = React.useState(false)
  return (
    <>
      <CreateButton
        onClick={() => {
          setOpen(p => !p)
          onClick()
        }}
      >
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

const ContentMenuWrapper = styled.div`
  position: relative;
`

const PlusButton = styled(Button)<{ open: boolean }>`
  border-radius: 10rem;
  padding: 0;
  width: 2.25rem;
  height: 2.25rem;
  margin: 0;
  position: relative;
  fill: white;
  border: 1px solid #0084ff;
  transform-origin: 50% 50%;
  transition: all 150ms ease-out;
  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    width: 1.75rem;
    height: 1.75rem;
  }
  &:focus {
    outline: none;
  }
  ${props =>
    props.open &&
    css`
      transform: rotate(45deg);
      background-color: white;
      border-color: #edecf3;
      fill: ${color('primary')};
      &:hover {
        background-color: #f6f6f9;
      }
    `};
`

const ContentMenu = styled.div<{ open: boolean }>`
  min-width: 12rem;
  border-radius: 1.5rem;
  border: 1px solid #edecf3;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 100% 0;
  box-shadow: ${p => p.theme.shadow.big};
  background-color: white;
  overflow: hidden;
  z-index: 100;

  ${props =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 2.75rem, 0) scale3d(1, 1, 1);
    `};
`

const CloseButton = styled.div`
  fill: ${color('medium')};
  cursor: pointer;
  transition: fill 85ms ease-out;
  &:hover {
    fill: ${color('dark')};
  }
`

const CreateButton = styled.button`
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
