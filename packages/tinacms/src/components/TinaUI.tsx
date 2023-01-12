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
import { ModalProvider } from '@einsteinindustries/tinacms-react-modals'
import { Theme } from '@einsteinindustries/tinacms-styles'
import {
  SidebarProvider,
  SidebarPosition,
} from '@einsteinindustries/tinacms-react-sidebar'
import { Toolbar } from '@einsteinindustries/tinacms-react-toolbar'
import { useCMS } from '../react-tinacms'
import { Alerts } from '@einsteinindustries/tinacms-react-alerts'
import { MediaManager } from './media'

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

  return (
    <ModalProvider>
      <Alerts alerts={cms.alerts} />
      {cms.enabled && styled && <Theme />}
      {cms.enabled && cms.toolbar && <Toolbar />}
      <MediaManager />
      {cms.sidebar ? (
        <SidebarProvider position={position} sidebar={cms.sidebar}>
          {children}
        </SidebarProvider>
      ) : (
        children
      )}
    </ModalProvider>
  )
}
