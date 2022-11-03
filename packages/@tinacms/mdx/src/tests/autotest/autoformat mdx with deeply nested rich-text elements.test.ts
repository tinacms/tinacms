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
import markdownString from './autoformat mdx with deeply nested rich-text elements.md?raw'
import markdownStringFormatted from './autoformat mdx with deeply nested rich-text elements.result.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'mdxJsxFlowElement',
      name: 'Test',
      children: [{ type: 'text', text: '' }],
      props: {
        leftColumn: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [{ type: 'text', text: 'foo bar baz left' }],
            },
          ],
        },
        rightColumn: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [{ type: 'text', text: 'foo bar baz right' }],
            },
            {
              type: 'mdxJsxFlowElement',
              name: 'Highlight',
              children: [{ type: 'text', text: '' }],
              props: {
                content: {
                  type: 'root',
                  children: [
                    {
                      type: 'p',
                      children: [{ type: 'text', text: 'Foo bar baz' }],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
    {
      type: 'mdxJsxFlowElement',
      name: 'Test',
      children: [{ type: 'text', text: '' }],
      props: {
        leftColumn: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [{ type: 'text', text: 'foo bar baz left' }],
            },
          ],
        },
        rightColumn: {
          type: 'root',
          children: [
            {
              type: 'p',
              children: [{ type: 'text', text: 'foo bar baz right' }],
            },
            {
              type: 'mdxJsxFlowElement',
              name: 'Highlight',
              children: [{ type: 'text', text: '' }],
              props: {
                content: {
                  type: 'root',
                  children: [
                    {
                      type: 'p',
                      children: [{ type: 'text', text: 'Foo bar baz' }],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
  ],
})

describe('./autoformat mdx with deeply nested rich-text elements.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownStringFormatted)
  })
})
