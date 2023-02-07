/**



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
