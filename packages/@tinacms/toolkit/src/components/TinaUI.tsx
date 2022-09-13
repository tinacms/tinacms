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
import { ModalProvider } from '../packages/react-modals'
import { Theme } from '../packages/styles'
import { SidebarProvider, SidebarPosition } from '../packages/react-sidebar'
import { Toolbar } from '../packages/react-toolbar'
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

export const TinaUI: React.FC<TinaUIProps> = ({
  children,
  position,
  styled = true,
}) => {
  const cms = useCMS()
  const [resizingSidebar, setResizingSidebar] = React.useState(false)

  return (
    <MutationSignalProvider>
      <style>{styles}</style>
      <ModalProvider>
        <div className="tina-tailwind">
          <Alerts alerts={cms.alerts} />
          {cms.enabled && styled && <Theme />}
          {cms.enabled && cms.toolbar && <Toolbar />}
          <MediaManager />
          {cms.sidebar && (
            <SidebarProvider
              resizingSidebar={resizingSidebar}
              setResizingSidebar={setResizingSidebar}
              position={position}
              sidebar={cms.sidebar}
            />
          )}
          <ActiveFieldIndicator />
        </div>
        {/* Dragging across the iframe causes mouse events to stop propagating so there's a laggy feeling without this */}
        <div className={`${resizingSidebar ? 'pointer-events-none' : ''}`}>
          {children}
        </div>
      </ModalProvider>
    </MutationSignalProvider>
  )
}
