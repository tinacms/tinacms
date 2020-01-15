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
import styled, { css } from 'styled-components'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
} from './modals/ModalProvider'
import { ModalPopup } from './modals/ModalPopup'
import { FormBuilder, FieldsBuilder } from '@tinacms/form-builder'
import { useMemo } from 'react'
import { Form } from '@tinacms/forms'
import { AddIcon } from '@tinacms/icons'
import {
  color,
  radius,
  font,
  IconButton,
  Button,
  shadow,
} from '@tinacms/styles'
import { Dismissible } from 'react-dismissible'
import { useCMS, useSubscribable } from '../react-tinacms'

export const CreateContentMenu = () => {
  const cms = useCMS()
  const [visible, setVisible] = React.useState(false)

  const contentCreatorPlugins = cms.plugins.findOrCreateMap('content-creator')

  useSubscribable(contentCreatorPlugins)

  if (contentCreatorPlugins.all().length) {
    return (
      <ContentMenuWrapper>
        <IconButton onClick={() => setVisible(true)} open={visible} primary>
          <AddIcon />
        </IconButton>
        <ContentMenu open={visible}>
          <Dismissible
            click
            escape
            onDismiss={() => setVisible(false)}
            disabled={!visible}
          >
            {contentCreatorPlugins.all().map(plugin => (
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

  return null
}

const CreateContentButton = ({ plugin, onClick }: any) => {
  const [open, setOpen] = React.useState(false)
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
  const cms = useCMS()
  const form: Form = useMemo(
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
    [close, cms, plugin]
  )
  return (
    <Modal>
      <FormBuilder form={form}>
        {({ handleSubmit }) => {
          return (
            <ModalPopup>
              <ModalHeader close={close}>{plugin.name}</ModalHeader>
              <ModalBody
                onKeyPress={e =>
                  e.charCode === 13 ? (handleSubmit() as any) : null
                }
              >
                <FieldsBuilder form={form} fields={form.fields} />
              </ModalBody>
              <ModalActions>
                <Button onClick={close}>Cancel</Button>
                <Button onClick={handleSubmit as any} primary>
                  Create
                </Button>
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

const ContentMenu = styled.div<{ open: boolean }>`
  min-width: 192px;
  border-radius: ${radius()};
  border: 1px solid ${color.grey(2)};
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 100% 0;
  box-shadow: ${shadow('big')};
  background-color: white;
  overflow: hidden;
  z-index: 100;

  ${props =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 44px, 0) scale3d(1, 1, 1);
    `};
`

const CreateButton = styled.button`
  position: relative;
  text-align: center;
  font-size: ${font.size(0)};
  padding: 0 12px;
  height: 40px;
  font-weight: 500;
  width: 100%;
  background: none;
  cursor: pointer;
  outline: none;
  border: 0;
  transition: all 85ms ease-out;
  &:hover {
    color: ${color.primary()};
    background-color: #f6f6f9;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }
`
