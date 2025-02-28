import { it, expect } from 'vitest'
import { parseMDX } from '../../../parse'
import { stringifyMDX } from '../../../stringify'
import { field } from './field'
import input from './in.md?raw'
import * as util from '../util'

it('matches input', () => {
  const tree = parseMDX(input, field, (v) => v)
  expect(util.print(tree)).toMatchFile(util.nodePath(__dirname))
  // Assertions on the autoformat are a little bit brittle because the embed key is auto-generated
  // Skipping those in these tests since this logic is tested elsewhere
})
