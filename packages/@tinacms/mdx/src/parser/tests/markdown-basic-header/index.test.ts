import { it, expect } from 'vitest'
import { parseMDX } from '../../..'
import { SlateRoot } from '../..'
import { stringifyMDX } from '../../../stringify'
import { field } from './field'
import input from './in.md?raw'
import * as util from '../../../next/tests/util'

it('matches input', () => {
  // SlateRoot.parse({ type: 'root', children: [{ type: 'text', value: 'hi' }] })
  const tree = parseMDX(input)
  if (tree) {
    expect(util.print(tree)).toMatchFile(util.nodePath(__dirname))
  }
  // const string = stringifyMDX(tree, field, (v) => v)
  // expect(string).toMatchFile(util.mdPath(__dirname))
})
