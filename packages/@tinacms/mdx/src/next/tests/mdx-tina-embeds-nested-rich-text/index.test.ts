import { it, expect } from 'vitest'
import { parseMDX } from '../../../parse'
import { stringifyMDX } from '../../../stringify'
import { field } from './field'
import input from './in.md?raw'
import output from './out.md?raw'
import outputContext from './out-context.md?raw'
import * as util from '../util'

it('matches input', () => {
  const tree = parseMDX(input, field, (v) => v)
  expect(util.print(tree)).toMatchFile(util.nodePath(__dirname))
  const contextOut = {}
  const string = stringifyMDX(tree, field, (v) => v, contextOut)
  expect(string).toBeDefined()
  let expected = output.replace(
    /\"_tinaEmbeds\.\w{6}\"/,
    '"_tinaEmbeds.random"'
  )
  let actual = string!.replace(/\"_tinaEmbeds\.\w{6}\"/, '"_tinaEmbeds.random"')
  expect(actual).toEqual(expected)

  expected = outputContext.replace(/^(\s*)(\w+):\s*\|/m, '$1random: |')
  const contextFrontmatter = util.frontmatterString(contextOut)
  actual = contextFrontmatter.replace(/^(\s*)(\w+):\s*\|/m, '$1random: |')
  expect(actual).toEqual(expected)
})
