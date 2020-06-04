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

import { render } from '@testing-library/react'
import React from 'react'
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
})
