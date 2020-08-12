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

import { render, act } from '@testing-library/react'
import React, { useEffect } from 'react'
import { TinaProvider, INVALID_CMS_ERROR } from './TinaProvider'
import { TinaCMS } from '../tina-cms'
import { CMS } from '@tinacms/core'

describe('TinaProvider', () => {
  describe('when passed an instance of CMS', () => {
    it('throws error', () => {
      const t = () => {
        render(<TinaProvider cms={new CMS() as any} />)
      }

      expect(t).toThrowError(INVALID_CMS_ERROR)
    })
  })
  describe('when passed an instance of TinaCMS', () => {
    it('throws no error', () => {
      render(<TinaProvider cms={new TinaCMS()} />)
    })
  })
  describe('when passed an empty object', () => {
    it('throws an Error', () => {
      const t = () => {
        render(<TinaProvider cms={{} as any} />)
      }

      expect(t).toThrowError(INVALID_CMS_ERROR)
    })
  })
  describe('when the CMS is enabled', () => {
    describe('when sidebar is true', () => {
      const cms = new TinaCMS({
        enabled: true,
        sidebar: true,
      })

      it('renders children', () => {
        const app = render(
          <TinaProvider cms={cms}>
            <span>something</span>
          </TinaProvider>
        )

        app.getByText('something')
      })
      it('renders the "toggle cms" sidebar button', () => {
        const app = render(<TinaProvider cms={cms} />)

        app.getByLabelText('toggles cms sidebar')
      })
    })
    describe('when sidebar is false', () => {
      const cms = new TinaCMS({
        enabled: true,
        sidebar: false,
      })

      it('renders children', () => {
        const app = render(
          <TinaProvider cms={cms}>
            <span>something</span>
          </TinaProvider>
        )

        app.getByText('something')
      })
      it('does not render the "toggle cms" sidebar button', () => {
        const app = render(<TinaProvider cms={cms} />)

        const sidebarButton = app.queryByLabelText('toggles cms sidebar')
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
          <TinaProvider cms={cms}>
            <span>something</span>
          </TinaProvider>
        )

        app.getByText('something')
      })
      it('does not render the "toggle cms" sidebar button', () => {
        const app = render(<TinaProvider cms={cms} />)

        const sidebarButton = app.queryByLabelText('toggles cms sidebar')
        expect(sidebarButton).toBeNull()
      })
      it('does not remount children when cms is toggled', () => {
        const cms = new TinaCMS({
          enabled: false,
          sidebar: true,
        })
        const onMount = jest.fn()
        function Child() {
          useEffect(onMount, [])
          return null
        }
        render(
          <TinaProvider cms={cms}>
            <Child />
          </TinaProvider>
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
          <TinaProvider cms={cms}>
            <span>something</span>
          </TinaProvider>
        )

        app.getByText('something')
      })
      it('does not render the "toggle cms" sidebar button', () => {
        const app = render(<TinaProvider cms={cms} />)

        const sidebarButton = app.queryByLabelText('toggles cms sidebar')
        expect(sidebarButton).toBeNull()
      })
    })
  })
})
