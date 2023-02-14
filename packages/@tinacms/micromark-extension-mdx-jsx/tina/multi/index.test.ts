import {it, expect, describe} from 'vitest'
import {toTree} from '../test-utils'

describe('tinaShortcodes', () => {
  it('with multistring patterns', () => {
    const value = `
{{< hello >}}
    `
    const patterns = [{start: '{{<', end: '>}}', type: 'flow', leaf: true}]
    const tree = toTree(value, patterns)
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "attributes": [],
            "children": [],
            "name": "hello",
            "type": "mdxJsxFlowElement",
          },
        ],
        "type": "root",
      }
    `)
  })
  // TODO
  it.skip('with multistring patterns', () => {
    const value = `
% hello %
    `
    const patterns = [{start: '%', end: '%', type: 'flow', leaf: true}]
    const tree = toTree(value, patterns)
    console.dir(tree, {depth: null})
    // expect(toTree(value, patterns)).toMatchInlineSnapshot(``)
  })
})
