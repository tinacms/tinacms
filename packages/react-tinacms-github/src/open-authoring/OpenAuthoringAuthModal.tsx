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

import { useCallback, useState } from 'react'
import { setForkName } from './repository'
import {
  useCMS,
  Modal,
  ModalPopup,
  ModalHeader,
  ModalBody,
  ModalActions,
} from 'tinacms'
import { TinaReset, Button as TinaButton } from '@tinacms/styles'

const OpenAuthoringAuthModal = ({
  onUpdateAuthState,
  close,
  authState,
  authenticate,
}) => {
  let modalProps

  const cms = useCMS()

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
            const { full_name } = await cms.api.github.createFork()
            setForkName(full_name)
            onUpdateAuthState()
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
          </ModalBody>
          <ModalActions>
            {modalProps.actions.map(action => (
              <AsyncButton {...action} />
            ))}
          </ModalActions>
        </ModalPopup>
      </Modal>
    </TinaReset>
  )
}

interface ButtonProps {
  name: string
  action(): Promise<void>
  primary: boolean
}
const AsyncButton = ({ name, primary, action }: ButtonProps) => {
  const [submitting, setSubmitting] = useState(false)

  const onClick = useCallback(async () => {
    setSubmitting(true)
    await action()
    setSubmitting(false)
  }, [action, setSubmitting])

  return (
    <TinaButton primary={primary} onClick={onClick} busy={submitting}>
      {name}
    </TinaButton>
  )
}

export default OpenAuthoringAuthModal
