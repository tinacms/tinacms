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
