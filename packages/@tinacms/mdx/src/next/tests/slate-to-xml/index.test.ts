import { it, expect } from 'vitest'
import { stringifyMDX } from '../../../stringify'
import { field } from './field'
import * as util from '../util'
import slateDoc from './node.json'
import output from './out.md?raw'
import { RootElement } from '../../../parse/plate'

it('slate to xml', () => {
  const tree = slateDoc as RootElement
  const xml = stringifyMDX(tree, field, (v) => v)
  console.log(xml)
  expect(xml).toEqual(output)
})
