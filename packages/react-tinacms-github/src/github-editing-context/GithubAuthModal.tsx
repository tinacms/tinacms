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

import { setForkName } from './repository'
import {
  useCMS,
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from 'tinacms'
import { TinaReset } from '@tinacms/styles'
import { AsyncButton } from '../components/AsyncButton'
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

const GithubAuthModal = ({
  onUpdateAuthState,
  close,
  authState,
  authenticate,
}: any) => {
  let modalProps

  const cms = useCMS()

  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    //clear error when authState changes
    if (error) {
      setError(undefined)
    }
  }, [authState])

  if (!authState.authenticated) {
    modalProps = {
      title: 'GitHub Authorization',
      message:
        'To save edits, Tina requires GitHub authorization. On save, changes will get commited to GitHub using your account.',
      actions: [
        {
          name: 'Cancel',
          action: close,
        },
        {
          name: 'Continue to GitHub',
          action: async () => {
            await authenticate()
            onUpdateAuthState()
          },
          primary: true,
        },
      ],
    }
  } else if (!authState.forkValid) {
    modalProps = {
      title: 'GitHub Authorization',
      message: 'A fork of this website is required to save changes.',
      actions: [
        {
          name: 'Cancel',
          action: close,
        },
        {
          name: 'Create Fork',
          action: async () => {
            try {
              const full_name = (await cms.api.github.createFork()).full_name
              setForkName(full_name)
              onUpdateAuthState()
            } catch (e) {
              setError(
                'Forking repository failed. Are you sure the repository is public?'
              )
              throw e
            }
          },
          primary: true,
        },
      ],
    }
  } else {
    return null
  }

  return (
    <TinaReset>
      <Modal>
        <ModalPopup>
          <ModalHeader close={close}>{modalProps.title}</ModalHeader>
          <ModalBody padded>
            <p>{modalProps.message}</p>
            {error && <ErrorLabel>{error}</ErrorLabel>}
          </ModalBody>
          <ModalActions>
            {modalProps.actions.map((action: any) => (
              <AsyncButton {...action} />
            ))}
          </ModalActions>
        </ModalPopup>
      </Modal>
    </TinaReset>
  )
}

export const ErrorLabel = styled.p`
  color: var(--tina-color-error) !important;
`

export default GithubAuthModal
