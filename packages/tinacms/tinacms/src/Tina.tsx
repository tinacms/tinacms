import * as React from 'react'
import { CMSContext } from '@tinacms/react-tinacms'
import { ModalProvider } from './modalProvider'
import { SidebarProvider, useSidebar } from './sidebarProvider'
import { cms } from './index'
import styled, { css } from 'styled-components'
import { SIDEBAR_WIDTH } from './Globals'

export const Tina: React.FC = ({ children, ...sidebar }) => {
  return (
    <CMSContext.Provider value={cms}>
      <ModalProvider>
        <SidebarProvider {...sidebar} />
        <SiteWrapper open={false} position={'fixed'}>
          {children}
        </SiteWrapper>
      </ModalProvider>
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
`
