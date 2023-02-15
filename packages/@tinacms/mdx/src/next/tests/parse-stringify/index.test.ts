import { describe, it, expect } from 'vitest'
import { removePosition } from './util'
import { parseMDX } from '../../parse'

describe('rich-text with MDX', () => {
  it(`works`, () => {
    const tree = parseMDX(
      `# hello

{{< some-feature >}}

{{< other-feature >}}

Testing

{{< /other-feature >}}

{{< /some-feature >}}
    `,
      {
        name: 'body',
        type: 'rich-text',
        parser: { type: 'markdown' },
        templates: [
          {
            name: 'someFeature',
            label: 'Some feature',
            match: { start: '{{<', end: '>}}', name: 'some-feature' },
            fields: [
              { name: '_value', type: 'string' },
              {
                name: 'children',
                type: 'rich-text',
                templates: [
                  {
                    name: 'otherFeature',
                    label: 'Other feature',
                    match: { start: '{{<', end: '>}}', name: 'other-feature' },
                    fields: [
                      { name: '_value', type: 'string' },
                      { name: 'children', type: 'rich-text' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }
    )
    console.dir(removePosition(tree), { depth: null })
    expect(true).toBe(true)
  })
})
