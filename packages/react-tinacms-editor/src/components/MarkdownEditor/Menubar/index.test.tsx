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

import React from 'react'
import { renderWithProviders } from '../../../test-utils/renderWithProviders'

import { Menubar } from './index'

describe('MenuBar', () => {
  it('should render Menubar', () => {
    renderWithProviders(<Menubar />)
    expect(document.getElementsByTagName('button').length).toBeGreaterThan(0)
  })

  it('should have markdown toggle option present', () => {
    const { findByTestId } = renderWithProviders(
      <Menubar uploadImages={(() => {}) as any} />
    )
    expect(findByTestId('markdown-toggle')).toBeDefined()
  })
})
