/**

Copyright 2021 Forestry.io Holdings, Inc.

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
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFullscreen,
  ModalPopup,
} from '@einsteinindustries/tinacms-react-modals'
import { ScreenPlugin } from '../screen-plugin'

export interface ScreenPluginModalProps {
  screen: ScreenPlugin
  close(): void
  back(): void
}

export const ScreenPluginModal: FC<ScreenPluginModalProps> = ({
  screen,
  close,
  back,
}) => {
  return (
    <ModalLayout
      name={screen.name}
      close={close}
      back={back}
      layout={screen.layout}
    >
      <screen.Component close={close} />
    </ModalLayout>
  )
}

interface ModalLayoutProps {
  children: any
  name: string
  close: any
  back(): void
  layout?: 'fullscreen' | 'popup'
}

const ModalLayout = ({
  children,
  name,
  close,
  back,
  layout,
}: ModalLayoutProps) => {
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
        <ModalHeader close={close} back={back}>
          {name}
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </Wrapper>
    </Modal>
  )
}
