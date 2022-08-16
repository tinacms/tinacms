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
import markdownString from './autoformat syntax changes.md?raw'
import markdownStringFormatted from './autoformat syntax changes.result.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'Red' }] },
          ],
        },
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'Green' }] },
          ],
        },
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'Blue' }] },
          ],
        },
      ],
    },
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'Red' }] },
          ],
        },
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'Green' }] },
          ],
        },
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'Blue' }] },
          ],
        },
      ],
    },
    {
      type: 'p',
      children: [{ type: 'text', text: 'single asterisks', italic: true }],
    },
    {
      type: 'p',
      children: [{ type: 'text', text: 'single underscores', italic: true }],
    },
    {
      type: 'p',
      children: [{ type: 'text', text: 'double asterisks', bold: true }],
    },
    {
      type: 'p',
      children: [{ type: 'text', text: 'double underscores', bold: true }],
    },
    { type: 'hr', children: [{ type: 'text', text: '' }] },
    { type: 'hr', children: [{ type: 'text', text: '' }] },
    { type: 'hr', children: [{ type: 'text', text: '' }] },
    { type: 'hr', children: [{ type: 'text', text: '' }] },
    { type: 'h1', children: [{ type: 'text', text: 'Headers' }] },
    { type: 'h1', children: [{ type: 'text', text: 'Header 1' }] },
    { type: 'h2', children: [{ type: 'text', text: 'Header 2' }] },
    {
      type: 'h1',
      children: [{ type: 'text', text: 'Indentation is ignored' }],
    },
  ],
})

describe('./autoformat syntax changes.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownStringFormatted)
  })
})
