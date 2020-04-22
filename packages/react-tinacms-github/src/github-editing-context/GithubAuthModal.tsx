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

  const cancelAction = {
    name: 'Cancel',
    action: close,
  }

  const visitDocsAction = {
    name: 'Visit the docs',
    action: async () => {
      window.open(
        'https://tinacms.org/docs/nextjs/github-public-repo#setting-environment-variables',
        '_blank'
      )
    },
    primary: true,
  }

  const createForkAction = {
    name: 'Create Fork',
    action: async () => {
      try {
        await cms.api.github.createFork()
        onUpdateAuthState()
      } catch (e) {
        setError(
          'Forking repository failed. Are you sure the repository is public?'
        )
        throw e
      }
    },
    primary: true,
  }

  const continueToGithubAction = {
    name: 'Continue to GitHub',
    action: async () => {
      await authenticate()
      onUpdateAuthState()
    },
    primary: true,
  }

  useEffect(() => {
    //clear error when authState changes
    if (error) {
      setError(undefined)
    }
  }, [authState])

  if (!cms.api.github.baseRepoFullName || !authState.clientId) {
    modalProps = {
      title: 'GitHub Configuration Incomplete',
      message:
        'The TinaCMS GitHub client was not configured completely. Please make sure the GITHUB_CLIENT_ID and REPO_FULL_NAME environment variables are set. For more information visit the docs.',
      actions: [cancelAction, visitDocsAction],
    }
  } else if (!authState.authenticated) {
    modalProps = {
      title: 'GitHub Authorization',
      message:
        'To save edits, Tina requires GitHub authorization. On save, changes will get committed to GitHub using your account.',
      actions: [cancelAction, continueToGithubAction],
    }
  } else if (!authState.forkValid) {
    modalProps = {
      title: 'GitHub Authorization',
      message: 'A fork of this website is required to save changes.',
      actions: [cancelAction, createForkAction],
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
