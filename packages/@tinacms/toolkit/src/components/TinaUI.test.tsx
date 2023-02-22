/**



*/

import { render, act } from '@testing-library/react'
import React, { useEffect } from 'react'
import { TinaCMSProvider } from './TinaCMSProvider'
import { TinaUI } from './TinaUI'
import { TinaCMS } from '../tina-cms'

describe('TinaUI', () => {
  describe('when the CMS is enabled', () => {
    describe('when sidebar is true', () => {
      const cms = new TinaCMS({
        enabled: true,
        sidebar: true,
      })
      cms.registerApi('admin', {
        fetchCollections: () => {
          return []
        },
      })

      it('renders children', () => {
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI>
              <span>something</span>
            </TinaUI>
          </TinaCMSProvider>
        )

        app.getByText('something')
      })
      it('renders the "open cms" sidebar button', () => {
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI />
          </TinaCMSProvider>
        )

        app.getByLabelText('opens cms sidebar')
      })
    })
    describe('when sidebar is false', () => {
      const cms = new TinaCMS({
        enabled: true,
        sidebar: false,
      })

      it('renders children', () => {
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI>
              <span>something</span>
            </TinaUI>
          </TinaCMSProvider>
        )

        app.getByText('something')
      })
      it('does not render the "opens cms" sidebar button', () => {
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI />
          </TinaCMSProvider>
        )

        const sidebarButton = app.queryByLabelText('opens cms sidebar')
        expect(sidebarButton).toBeNull()
      })
    })
  })
  describe('when the CMS is disabled', () => {
    describe('when sidebar is true', () => {
      const cms = new TinaCMS({
        enabled: false,
        sidebar: true,
      })

      it('renders children', () => {
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI>
              <span>something</span>
            </TinaUI>
          </TinaCMSProvider>
        )

        app.getByText('something')
      })
      it('does not render the "opens cms" sidebar button', () => {
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI />
          </TinaCMSProvider>
        )

        const sidebarButton = app.queryByLabelText('opens cms sidebar')
        expect(sidebarButton).toBeNull()
      })
      it('does not remount children when cms is toggled', () => {
        const cms = new TinaCMS({
          enabled: false,
          sidebar: true,
        })
        cms.registerApi('admin', {
          fetchCollections: () => {
            return []
          },
        })

        const onMount = jest.fn()
        function Child() {
          useEffect(onMount, [])
          return null
        }
        render(
          <TinaCMSProvider cms={cms}>
            <TinaUI>
              <Child />
            </TinaUI>
          </TinaCMSProvider>
        )

        act(() => {
          cms.enable()
        })

        expect(onMount).toHaveBeenCalledTimes(1)
      })
    })
    describe('when sidebar is false', () => {
      const cms = new TinaCMS({
        enabled: false,
        sidebar: false,
      })

      it('renders children', () => {
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI>
              <span>something</span>
            </TinaUI>
          </TinaCMSProvider>
        )

        app.getByText('something')
      })
      it('does not render the "opens cms" sidebar button', () => {
        const app = render(
          <TinaCMSProvider cms={cms}>
            <TinaUI />
          </TinaCMSProvider>
        )

        const sidebarButton = app.queryByLabelText('opens cms sidebar')
        expect(sidebarButton).toBeNull()
      })
    })
  })
})
