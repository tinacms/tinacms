import * as React from 'react'
import { FC } from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFullscreen,
  ModalPopup,
} from '@toolkit/react-modals'
import { ScreenPlugin } from '../screen-plugin'

export interface ScreenPluginModalProps {
  screen: ScreenPlugin
  close(): void
}

export const ScreenPluginModal: FC<ScreenPluginModalProps> = ({
  screen,
  close,
}) => {
  return (
    <ModalLayout name={screen.name} close={close} layout={screen.layout}>
      <screen.Component close={close} />
    </ModalLayout>
  )
}

interface ModalLayoutProps {
  children: any
  name: string
  close: any
  layout?: 'fullscreen' | 'popup'
}

const ModalLayout = ({ children, name, close, layout }: ModalLayoutProps) => {
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
        <ModalBody
          className={layout === 'fullscreen' ? 'flex h-full flex-col' : ''}
        >
          {children}
        </ModalBody>
      </Wrapper>
    </Modal>
  )
}
