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
import markdownString from './lists.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [{ type: 'text', text: 'This is an item' }],
            },
            {
              type: 'ul',
              children: [
                {
                  type: 'li',
                  children: [
                    {
                      type: 'lic',
                      children: [{ type: 'text', text: 'this is a sub-item' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [{ type: 'text', text: 'this is another item' }],
            },
          ],
        },
      ],
    },
    { type: 'hr', children: [{ type: 'text', text: '' }] },
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            {
              type: 'lic',
              children: [
                { type: 'text', text: 'this is an ' },
                { type: 'text', text: 'item', bold: true },
                { type: 'text', text: ' and a ' },
                {
                  type: 'a',
                  url: 'http://example.com',
                  title: null,
                  children: [{ type: 'text', text: 'link' }],
                },
              ],
            },
          ],
        },
      ],
    },
    { type: 'hr', children: [{ type: 'text', text: '' }] },
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'list item 1' }] },
            {
              type: 'ol',
              children: [
                {
                  type: 'li',
                  children: [
                    {
                      type: 'lic',
                      children: [{ type: 'text', text: 'sub list item 1A' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'list item 2' }] },
          ],
        },
      ],
    },
  ],
})

describe('./lists.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
