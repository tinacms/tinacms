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
import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './image.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'p',
      children: [
        {
          type: 'img',
          url: 'https://some-image.jpg',
          alt: 'alt description',
          caption: 'Some Title',
          children: [{ type: 'text', text: '' }],
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'img',
          url: 'https://some-image.jpg',
          alt: '',
          caption: 'Some title',
          children: [{ type: 'text', text: '' }],
        },
      ],
    },
    {
      type: 'p',
      children: [
        {
          type: 'img',
          url: 'https://some-image.jpg',
          alt: '',
          caption: null,
          children: [{ type: 'text', text: '' }],
        },
      ],
    },
  ],
})

describe('./image.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
