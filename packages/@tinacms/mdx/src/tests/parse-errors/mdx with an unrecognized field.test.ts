import { it, expect } from 'vitest'
import { parseMDX } from '../../parse'
import { field } from '../autotest/_config'
const md = `<Greeting unrecognizedField="hello" />`

it('Throws an error', () => {
  expect(() =>
    parseMDX(md, field, (v) => v)
  ).toThrowErrorMatchingInlineSnapshot(
    '"Unable to find field definition for property \\"unrecognizedField\\""'
  )
})
