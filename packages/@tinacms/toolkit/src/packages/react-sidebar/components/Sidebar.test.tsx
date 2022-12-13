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

import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import React from 'react'
import { SidebarProvider } from './Sidebar'
import { TinaCMSProvider, TinaCMS } from '../../..'

const createClient = (isLocal) =>
  new TinaCMS({
    enabled: true,
    sidebar: true,
    apis: {
      tina: { isLocalMode: isLocal },
    },
  })

describe('Sidebar', () => {
  describe('with local client', () => {
    const cms = createClient(true)
    cms.registerApi('admin', {
      fetchCollections: () => {
        return []
      },
    })

    it('shows local banner', () => {
      const { queryByText } = render(
        <TinaCMSProvider cms={cms}>
          <SidebarProvider sidebar={cms.sidebar}>
            <div>My site</div>
          </SidebarProvider>
        </TinaCMSProvider>
      )

      const banner = queryByText(/Local Mode/)
      expect(banner).toBeInTheDocument()
    })
  })

  describe('with prod client', () => {
    const cms = createClient(false)
    cms.registerApi('admin', {
      fetchCollections: () => {
        return []
      },
    })

    it('doesnt show local banner', () => {
      const { queryByText } = render(
        <TinaCMSProvider cms={cms}>
          <SidebarProvider sidebar={cms.sidebar}>
            <div>My site</div>
          </SidebarProvider>
        </TinaCMSProvider>
      )

      const banner = queryByText(/Local Mode/)
      expect(banner).not.toBeInTheDocument()
    })
  })
})
