import { describe, expect, it } from 'vitest'
import type * as Md from 'mdast'
import { toTinaMarkdown } from './index'
import { RichTextField } from '@tinacms/schema-tools'

describe('stringify', () => {
  describe('toTinaMarkdown', () => {
    it('should stringify with soft break and trailing empty string', () => {
      const value = {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', value: 'para1' },
              { type: 'break' },
              { type: 'text', value: '' },
            ],
          },
        ],
      }

      const markdown = toTinaMarkdown(value as Md.Root, {} as RichTextField)

      expect(markdown).toMatchInlineSnapshot(`
        "para1
        "
      `)
    })
  })
})
