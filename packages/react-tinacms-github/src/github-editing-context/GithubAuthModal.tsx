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

import {
  useCMS,
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from 'tinacms'
import { StyleReset } from '@tinacms/styles'
import { AsyncButton } from '../components/AsyncButton'
import React, { useState } from 'react'
import styled from 'styled-components'

export interface GithubAuthenticationModalProps {
  onAuthSuccess(): void
  close(): void
}

export function GithubAuthenticationModal({
  onAuthSuccess,
  close,
}: GithubAuthenticationModalProps) {
  const cms = useCMS()
  return (
    <ModalBuilder
      title="GitHub Authorization"
      message="To save edits, Tina requires GitHub authorization. On save, changes will get commited to GitHub using your account."
      close={close}
      actions={[
        {
          name: 'Cancel',
          action: close,
        },
        {
          name: 'Continue to GitHub',
          action: async () => {
            await cms.api.github.authenticate()
            onAuthSuccess()
          },
          primary: true,
        },
      ]}
    />
  )
}

export interface CreateForkModalProps {
  onForkCreated(): void
  close(): void
}

export function CreateForkModal({
  onForkCreated,
  close,
}: CreateForkModalProps) {
  const cms = useCMS()
  const [error, setError] = useState<string | undefined>()
  return (
    <ModalBuilder
      title="GitHub Authorization"
      message="A fork of this website is required to save changes."
      close={close}
      actions={[
        {
          name: 'Cancel',
          action: close,
        },
        {
          name: 'Create Fork',
          action: async () => {
            try {
              await cms.api.github.createFork()
              onForkCreated()
            } catch (e) {
              setError(
                'Forking repository failed. Are you sure the repository is public?'
              )
              throw e
            }
          },
          primary: true,
        },
      ]}
      error={error}
    />
  )
}

interface ModalBuilderProps {
  title: string
  message: string
  error?: string
  actions: any[]
  close(): void
}

export function ModalBuilder(modalProps: ModalBuilderProps) {
  return (
    <StyleReset>
      <Modal>
        <ModalPopup>
          <ModalHeader close={modalProps.close}>{modalProps.title}</ModalHeader>
          <ModalBody padded>
            <p>{modalProps.message}</p>
            {modalProps.error && <ErrorLabel>{modalProps.error}</ErrorLabel>}
          </ModalBody>
          <ModalActions>
            {modalProps.actions.map((action: any) => (
              <AsyncButton {...action} />
            ))}
          </ModalActions>
        </ModalPopup>
      </Modal>
    </StyleReset>
  )
}

export const ErrorLabel = styled.p`
  color: var(--tina-color-error) !important;
`
