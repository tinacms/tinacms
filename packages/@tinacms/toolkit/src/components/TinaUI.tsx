/**



*/

import * as React from 'react'
import { ModalProvider } from '../packages/react-modals'
import { SidebarProvider, SidebarPosition } from '../packages/react-sidebar'
import { useCMS } from '../react-tinacms/use-cms'
import { Alerts } from '../packages/react-alerts'
import { MediaManager } from './media'
import { ActiveFieldIndicator } from './ActiveFieldIndicator'
import { MutationSignalProvider } from './MutationSignal'
// @ts-ignore importing css is not recognized
import styles from '../styles.css'

export interface TinaUIProps {
  position?: SidebarPosition
  styled?: boolean
  children?: React.ReactNode
}

export const TinaUI: React.FC<TinaUIProps> = ({ children, position }) => {
  const cms = useCMS()
  const [resizingSidebar, setResizingSidebar] = React.useState(false)

  return (
    <MutationSignalProvider>
      <style>{styles}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Inter:400,600"
        media="all"
      ></link>
      <ModalProvider>
        <div className="tina-tailwind">
          <Alerts alerts={cms.alerts} />
          <MediaManager />
          {cms.sidebar && (
            <SidebarProvider
              resizingSidebar={resizingSidebar}
              setResizingSidebar={setResizingSidebar}
              position={position}
              sidebar={cms.sidebar}
            />
          )}
          {/* <ActiveFieldIndicator /> */}
        </div>
        {/* Dragging across the iframe causes mouse events to stop propagating so there's a laggy feeling without this */}
        <div className={`${resizingSidebar ? 'pointer-events-none' : ''}`}>
          {children}
        </div>
      </ModalProvider>
    </MutationSignalProvider>
  )
}
