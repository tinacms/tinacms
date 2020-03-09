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
import { FC } from 'react'
import { Modal, ModalHeader, ModalBody } from '../modals/ModalProvider'
import { ModalFullscreen } from '../modals/ModalFullscreen'
import { ModalPopup } from '../modals/ModalPopup'
import { ScreenPlugin } from '../../plugins/screen-plugin'

export interface ScreenPluginViewProps {
  screen: ScreenPlugin
  close(): void
}

export const ScreenPluginView: FC<ScreenPluginViewProps> = ({
  screen,
  close,
}) => {
  return (
    <ScreenPluginModal name={screen.name} close={close} layout={screen.layout}>
      <screen.Component close={close} />
    </ScreenPluginModal>
  )
}

interface ScreenPluginModalProps {
  children: any
  name: string
  close: any
  layout?: 'fullscreen' | 'popup'
}

const ScreenPluginModal = ({
  children,
  name,
  close,
  layout,
}: ScreenPluginModalProps) => {
  let Wrapper

  switch (layout) {
    case 'popup':
      Wrapper = ModalPopup
      break
    case 'fullscreen':
      Wrapper = ModalFullscreen
      break
    default:
      Wrapper = ModalPopup
      break
  }

  return (
    <Modal>
      <Wrapper>
        <ModalHeader close={close}>{name}</ModalHeader>
        <ModalBody>{children}</ModalBody>
      </Wrapper>
    </Modal>
  )
}
