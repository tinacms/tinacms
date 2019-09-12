import * as React from 'react'
import { CMSContext } from '@tinacms/react-tinacms'
import { ModalProvider } from './modalProvider'
import { SidebarContext, useSidebar } from './sidebarProvider'
import { cms } from './index'
import styled, { css, ThemeProvider } from 'styled-components'

import { Theme, GlobalStyles } from './Globals'
import { Sidebar } from './sidebar'
import { TinaReset, SIDEBAR_WIDTH } from './Globals'

interface TinaProps {
  position: 'fixed' | 'float'
}

export const Tina: React.FC<TinaProps> = ({ children, position }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const props = {
    isOpen,
    setIsOpen,
  }

  return (
    <CMSContext.Provider value={cms}>
      <SidebarContext.Provider value={props}>
        <ThemeProvider theme={Theme}>
          <ModalProvider>
            <TinaReset>
              <Sidebar />
            </TinaReset>
          </ModalProvider>
        </ThemeProvider>
        <SiteWrapper open={isOpen} position={position}>
          {children}
        </SiteWrapper>
      </SidebarContext.Provider>
    </CMSContext.Provider>
  )
}

const SiteWrapper = styled.div<{ open: boolean; position: string }>`
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  height: 100% !important;
  z-index: -1 !important;
  width: ${props =>
    props.position === 'fixed' && props.open
      ? 'calc(100% - ' + SIDEBAR_WIDTH + ')'
      : '100%'} !important;
  transition: all ${props => (props.open ? 150 : 200)}ms ease-out !important;
`
