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

import React, { useState } from 'react'
import { Modal, ModalPopup, ModalHeader, ModalBody } from 'tinacms'
import { PullRequestIcon } from '@tinacms/icons'

import { PRModal } from './PRModal'
import { ToolbarButton } from '../../components/ToolbarButton'
import { DesktopLabel } from '../../components/DesktopLabel'

export const PullRequestToolbarWidget = {
  __type: 'toolbar:widget',
  name: 'create-pr',
  weight: 5,
  component: PullRequestButton,
}

function PullRequestButton() {
  const [opened, setOpened] = useState(false)
  const close = () => setOpened(false)
  return (
    <>
      <ToolbarButton onClick={() => setOpened(p => !p)}>
        <PullRequestIcon />
        <DesktopLabel> Pull Request</DesktopLabel>
      </ToolbarButton>
      {opened && (
        <Modal>
          <ModalPopup>
            <ModalHeader close={close}>Pull Request</ModalHeader>
            <ModalBody>
              <PRModal />
            </ModalBody>
          </ModalPopup>
        </Modal>
      )}
    </>
  )
}
