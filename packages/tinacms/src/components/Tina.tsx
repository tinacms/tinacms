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
import { ModalProvider } from './modals/ModalProvider'
import styled from 'styled-components'
import { TinaReset, GlobalStyles } from '@tinacms/styles'
import { Sidebar } from './sidebar/Sidebar'
import { SIDEBAR_WIDTH } from '../Globals'
import { TinaCMS, SidebarPosition } from '../tina-cms'
import { CMSContext, useSubscribable } from '../react-tinacms'
import { Alerts } from './Alerts'

export interface TinaProps {
  cms: TinaCMS
  hidden?: boolean
  position?: SidebarPosition
}

export const Tina: React.FC<TinaProps> = ({
  cms,
  children,
  hidden,
  position,
}) => {
  useSubscribable(cms.sidebar)

  React.useEffect(() => {
    if (typeof hidden !== 'undefined') {
      cms.sidebar.hidden = hidden
    }
  }, [hidden])

  return (
    <CMSContext.Provider value={cms}>
      <SiteWrapper
        open={cms.sidebar.isOpen}
        position={position || cms.sidebar.position}
      >
        {children}
      </SiteWrapper>
      {!cms.sidebar.hidden && (
        <>
          <GlobalStyles />
          <ModalProvider>
            <TinaReset>
              <Alerts />
              <Sidebar />
            </TinaReset>
          </ModalProvider>
        </>
      )}
    </CMSContext.Provider>
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
