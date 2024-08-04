import { it, expect } from 'vitest'
import { parseMDX } from '../../../parse'
import { stringifyMDX } from '../../../stringify'
import { field } from './field'
import input from './in.md?raw'
import * as util from '../util'

it('matches input', () => {
  const tree = parseMDX(input, field, (v) => v)
  expect(util.print(tree)).toMatchFile(util.nodePath(__dirname))
  const contextOut = {}
  const string = stringifyMDX(tree, field, (v) => v, contextOut)
  const contextFrontmatter = util.frontmatterString(contextOut)
  // expect(string).toMatchFile(util.mdPath(__dirname))
  // expect(contextFrontmatter).toMatchFile(util.mdContextPath(__dirname))
})
