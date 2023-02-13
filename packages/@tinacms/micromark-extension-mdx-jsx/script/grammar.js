/**
 * @typedef {import('mdast').Root} Root
 */

import fs from 'node:fs'
import path from 'node:path'
import {zone} from 'mdast-zone'

const syntax = fs.readFileSync(path.join('script', 'grammar.html'))

export default function grammar() {
  /** @param {Root} tree */
  return function (tree) {
    zone(tree, 'grammar', (start, _, end) => [
      start,
      {type: 'html', value: '<pre><code>' + syntax + '</code></pre>'},
      end
    ])
  }
}
