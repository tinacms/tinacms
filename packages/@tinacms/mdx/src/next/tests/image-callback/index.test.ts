import { it, expect } from 'vitest'
import { parseMDX } from '../../parse'
import { stringifyMDX } from '../../stringify'
import { field } from './field'
import input from './in.md?raw'
import * as util from '../util'

it('matches input', () => {
  const parseImageCallback = (v: string) => `http://some-url${v}`
  const stringifyImageCallback = (v: string) => v.replace('http://some-url', '')
  const tree = parseMDX(input, field, parseImageCallback)
  const string = stringifyMDX(tree, field, stringifyImageCallback)
  expect(util.print(tree)).toMatchFile(util.nodePath(__dirname))
  expect(string).toMatchFile(util.mdPath(__dirname))
})
