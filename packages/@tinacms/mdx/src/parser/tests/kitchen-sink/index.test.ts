import { it, expect } from 'vitest'
import { parseMDX } from '../../..'
import { SlateRoot } from '../..'
import { stringifyMDX } from '../../stringify'
import { field } from './field'
import input from './in.md?raw'
import * as util from '../../../next/tests/util'

it('matches input', () => {
  const tree = parseMDX(input)
  if (tree) {
    expect(util.print(tree)).toMatchFile(util.nodePath(__dirname))
  }
  const string = stringifyMDX(tree)
  expect(string).toMatchFile(util.mdPath(__dirname))
})
