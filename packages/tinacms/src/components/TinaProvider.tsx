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
import { Toolbar } from '@tinacms/react-toolbar'
import { TinaCMS } from '../tina-cms'
import { CMSContext } from '../react-tinacms'
import { Alerts } from '@tinacms/react-alerts'
import { useState, useEffect } from 'react'
import { MediaManager } from './media'
import { Plugin } from '@tinacms/core'

export interface TinaProviderProps {
  cms: TinaCMS
  hidden?: boolean
  position?: SidebarPosition
  styled?: boolean
}

export interface WrapperPlugin extends Plugin {
  __type: 'unstable:wrapper'
  wrap: (children: React.ReactNode) => JSX.Element
}

export const INVALID_CMS_ERROR =
  'The `cms` prop must be an instance of `TinaCMS`.'

export const TinaProvider: React.FC<TinaProviderProps> = ({
  cms,
  children,
  position,
  styled = true,
}) => {
  const [enabled, setEnabled] = useState(cms.enabled)

  useEffect(() => {
    return cms.events.subscribe('cms', () => {
      setEnabled(cms.enabled)
    })
  }, [])

  if (!(cms instanceof TinaCMS)) {
    throw new Error(INVALID_CMS_ERROR)
  }

  const [wrappers, setWrappers] = React.useState(() =>
    cms.plugins.getType<WrapperPlugin>('unstable:wrapper').all()
  )
  React.useEffect(() => {
    return cms.events.subscribe('plugin:add:unstable:wrapper', () => {
      setWrappers(cms.plugins.getType<WrapperPlugin>('unstable:wrapper').all())
    })
  }, [])

  const componentStack = React.useMemo(
    () => wrappers.reduce((stack, wrapper) => wrapper.wrap(stack), children),
    [wrappers, children]
  )

  return (
    <CMSContext.Provider value={cms}>
      <ModalProvider>
        <Alerts alerts={cms.alerts} />
        {enabled && styled && <Theme />}
        {enabled && cms.toolbar && <Toolbar />}
        <MediaManager />
        {cms.sidebar ? (
          <SidebarProvider position={position} sidebar={cms.sidebar}>
            {componentStack}
          </SidebarProvider>
        ) : (
          componentStack
        )}
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
