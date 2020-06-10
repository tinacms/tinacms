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
import { renderWithProviders } from '../../test-utils/renderWithProviders'

import { MarkdownEditor } from './index'

describe('MarkdownEditor', () => {
  it('should render MarkdownEditor', () => {
    const { getByTestId } = renderWithProviders(
      <MarkdownEditor onChange={() => {}} value="" />
    )
    expect(getByTestId('markdown-editing-textarea')).toBeDefined()
  })

  it('should include Menubar', () => {
    renderWithProviders(<MarkdownEditor onChange={() => {}} value="" />)
    expect(document.getElementsByTagName('button').length).toBeGreaterThan(0)
  })

  it('should include image menu option if imageProps are defined', () => {
    const { getByTestId } = renderWithProviders(
      <MarkdownEditor
        onChange={() => {}}
        value=""
        imageProps={{ upload: (() => {}) as any }}
      />
    )
    expect(getByTestId('image-menu')).toBeDefined()
  })
})
