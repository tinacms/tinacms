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
import markdownString from './marks.md?raw'

const out = output({
  type: 'root',
  children: [
    {
      type: 'p',
      children: [
        { type: 'text', text: 'Some ' },
        { type: 'text', text: 'bold', bold: true },
        { type: 'text', text: ' text' },
      ],
    },
    {
      type: 'p',
      children: [
        { type: 'text', text: 'Some ' },
        { type: 'text', text: 'bold and emphasized', italic: true, bold: true },
        { type: 'text', text: ' text' },
      ],
    },
    {
      type: 'p',
      children: [
        { type: 'text', text: 'Marks with ' },
        { type: 'text', text: 'emphasized text nesting ', italic: true },
        { type: 'text', text: 'bold', italic: true, bold: true },
        { type: 'text', text: ' text', italic: true },
      ],
    },
    {
      type: 'p',
      children: [
        { type: 'text', text: 'Hello ', bold: true },
        { type: 'text', text: 'world', bold: true, italic: true },
        { type: 'text', text: ', again', bold: true },
        { type: 'text', text: ' ' },
        { type: 'text', text: 'here', italic: true },
      ],
    },
    {
      type: 'p',
      children: [
        { type: 'text', text: 'Some ' },
        { type: 'text', text: 'inline code', code: true },
        { type: 'text', text: ' examples' },
      ],
    },
    {
      type: 'p',
      children: [
        { type: 'text', text: 'Hello ', italic: true },
        { type: 'text', text: 'some code', code: true, italic: true },
        { type: 'text', text: ', again', italic: true },
      ],
    },
    {
      type: 'p',
      children: [
        { type: 'text', text: 'Hello ', bold: true },
        {
          type: 'a',
          url: 'https://example.com',
          title: 'Example Site',
          children: [{ type: 'text', text: 'world', bold: true }],
        },
      ],
    },
    {
      type: 'p',
      children: [
        { type: 'text', text: 'Hello ', italic: true, bold: true },
        {
          type: 'a',
          url: 'https://example.com',
          title: 'Example Site',
          children: [{ type: 'text', text: 'world', italic: true, bold: true }],
        },
        {
          type: 'text',
          text: ' And some other text, which has a ',
          italic: true,
        },
        {
          type: 'a',
          url: 'https://something.com',
          title: null,
          children: [{ type: 'text', text: 'link to something', italic: true }],
        },
      ],
    },
  ],
})

describe('./marks.md', () => {
  it('parses the string in the expected AST', () => {
    expect(parseMDX(markdownString, field, (v) => v)).toMatchObject(out)
  })
  it('stringifies the AST into the expect string', () => {
    expect(stringifyMDX(out, field, (v) => v)).toEqual(markdownString)
  })
})
