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
import { ModalProvider } from '@tinacms/react-modals'
import { Theme } from '@tinacms/styles'
import { SidebarProvider, SidebarPosition } from '@tinacms/react-sidebar'
import { ToolbarProvider } from '@tinacms/react-toolbar'
import { TinaCMS } from '../tina-cms'
import { CMSContext } from '../react-tinacms'
import { Alerts } from '@tinacms/react-alerts'

export interface TinaProviderProps {
  cms: TinaCMS
  hidden?: boolean
  position?: SidebarPosition
  styled?: boolean
}

export const TinaProvider: React.FC<TinaProviderProps> = ({
  cms,
  children,
  hidden,
  position,
  styled = true,
}) => {
  return (
    <CMSContext.Provider value={cms}>
      <ModalProvider>
        {cms.enabled && styled && <Theme />}
        <Alerts alerts={cms.alerts} />
        <ToolbarProvider hidden={hidden} toolbar={cms.toolbar} />
        <SidebarProvider
          hidden={hidden}
          position={position}
          sidebar={cms.sidebar}
        >
          {children}
        </SidebarProvider>
      </ModalProvider>
    </CMSContext.Provider>
  )
}

/**
 * @deprecated This has been renamed to `TinaProvider`.
 */
export const Tina = TinaProvider

/**
 * @deprecated This has been renamed to `TinaProviderProps`.
 */
export type TinaProps = TinaProviderProps
