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
import { useState } from 'react'
import {
  ModalProvider,
  Modal,
  ModalHeader,
  ModalBody,
} from './modals/ModalProvider'
import { ModalFullscreen } from './modals/ModalFullscreen'
import styled, { ThemeProvider } from 'styled-components'
import { TinaReset, Theme, DefaultTheme, ThemeProps } from '@tinacms/styles'
import { Sidebar } from './sidebar/Sidebar'
import { SIDEBAR_WIDTH } from '../Globals'
import { TinaCMS } from '../tina-cms'
import { CMSContext, useSubscribable } from '../react-tinacms'
import { MediaProps } from '../media'
import { MediaManager } from './MediaManager'
import { Dismissible } from 'react-dismissible'

const merge = require('lodash.merge')

export type SidebarPosition = 'fixed' | 'float' | 'displace' | 'overlay'

export interface TinaProps {
  cms: TinaCMS
  position: SidebarPosition
  hidden?: boolean
  theme?: Theme
}

export const Tina: React.FC<TinaProps> = ({
  cms,
  children,
  position,
  hidden,
  theme: themeOverrides,
}) => {
  useSubscribable(cms.sidebar)
  const theme: ThemeProps['theme'] = React.useMemo(
    () => ({
      tinacms: merge(DefaultTheme, themeOverrides) as Theme,
    }),
    [DefaultTheme, themeOverrides]
  )

  return (
    <CMSContext.Provider value={cms}>
      <SiteWrapper open={cms.sidebar.isOpen} position={position}>
        {children}
      </SiteWrapper>
      {!hidden && (
        <ThemeProvider theme={theme}>
          <ModalProvider>
            <TinaReset>
              <Sidebar />
              <div
                style={{
                  position: 'absolute',
                  zIndex: 9999,
                }}
              >
                <button
                  onClick={() => {
                    cms.media.open({
                      onChoose: (media: any) => {
                        alert(`INSERTING: ${media[0].src}`)
                      },
                    })
                  }}
                >
                  Open media
                </button>
              </div>
              <MediaManagerModal cms={cms} />
            </TinaReset>
          </ModalProvider>
        </ThemeProvider>
      )}
    </CMSContext.Provider>
  )
}

const MediaManagerModal = ({ cms }: { cms: TinaCMS }) => {
  let [isOpen, setIsOpen] = useState(false)
  let [mediaProps, setMediaProps] = useState({} as any)
  useSubscribable(cms.media, (props: any) => {
    setIsOpen(true)
    setMediaProps(props)
  })

  if (!isOpen) {
    return null
  }
  return (
    <Modal>
      <Dismissible onDismiss={() => setIsOpen(false)} escape click>
        <ModalFullscreen>
          <ModalHeader close={() => setIsOpen(false)}>Media</ModalHeader>
          <ModalBody padded>
            <MediaManager
              {...mediaProps}
              onChoose={selected => {
                mediaProps.onChoose(selected)
                setIsOpen(false)
              }}
            />
          </ModalBody>
        </ModalFullscreen>
      </Dismissible>
    </Modal>
  )
}

const SiteWrapper = styled.div<{ open: boolean; position: SidebarPosition }>`
  opacity: 1 !important;
  background-color: transparent !important;
  background-image: none !important;
  overflow: visible !important;
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  height: 100% !important;
  width: ${props =>
    isFixed(props.position) && props.open
      ? 'calc(100% - ' + SIDEBAR_WIDTH + 'px)'
      : '100%'} !important;
  transition: all ${props => (props.open ? 150 : 200)}ms ease-out !important;
`

function isFixed(position: SidebarPosition): boolean {
  return position === 'fixed' || position === 'displace'
}
