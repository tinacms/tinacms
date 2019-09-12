import * as React from 'react'
import { CMSContext } from '@tinacms/react-tinacms'
import { ModalProvider } from './modalProvider'
import { SidebarContext, useSidebar } from './sidebarProvider'
import { cms } from './index'
import styled, { css, ThemeProvider } from 'styled-components'

import { Theme, GlobalStyles } from './Globals'
import { Sidebar } from './sidebar'
import { SIDEBAR_WIDTH } from './Globals'


interface TinaProps {
  position:'fixed'|'float'
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
              <GlobalStyles />
              <Sidebar />
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
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  z-index: -1;
  width: ${props =>
    props.position === 'fixed' && props.open
      ? 'calc(100% - ' + SIDEBAR_WIDTH + ')'
      : '100%'};
  transition: all ${props => (props.open ? 150 : 200)}ms ease-out;
`
