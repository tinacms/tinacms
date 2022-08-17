import { describe, it, expect } from 'vitest'
import { field, output, parseMDX, stringifyMDX } from './_config'
import markdownString from './lists.md?raw'
undefined

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
    { type: 'hr', children: [{ type: 'text', text: '' }] },
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: [
            { type: 'lic', children: [{ type: 'text', text: 'On Monday' }] },
            {
              type: 'ol',
              children: [
                {
                  type: 'li',
                  children: [
                    {
                      type: 'lic',
                      children: [
                        { type: 'text', text: 'next', code: true },
                        { type: 'text', text: ' is merged into ' },
                        { type: 'text', text: 'latest', code: true },
                        { type: 'text', text: '; then ' },
                        { type: 'text', text: 'latest', code: true },
                        { type: 'text', text: ' is published to npm' },
                      ],
                    },
                  ],
                },
              ],
            },
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
