import { it, expect } from 'vitest'
import { stringifyMDX } from '../../../stringify'
import { field } from './field'
import slateDoc from './node.json'
import output from './out.xml?raw'
import { RootElement } from '../../../parse/plate'
import { parseMDX } from '../../../parse'

it('slate to xml', () => {
  const tree = slateDoc as RootElement
  const xml = stringifyMDX(tree, field, (v) => v)
  console.log(xml)
  expect(xml).toEqual(output)
})

it('xml to slate', () => {
  const xml = output
  const tree = parseMDX(xml, field, (v) => v)
  console.log(JSON.stringify(tree))
  // Check that first node is "root"
  expect(tree.type).toEqual('root')
  // Check that the node at the following path is the same type (mdxJsxTextElement)
  expect(tree.children[1]!.children[1]!.type).toEqual(
    slateDoc.children[1]!.children[1]!.type
  )
})
