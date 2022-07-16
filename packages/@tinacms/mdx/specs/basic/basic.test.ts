import { field, parseThenStringify, expect, it, writeSnapshot } from '../runner'
import out from './out'
import content from './content.md?raw'
import outString from './out.ts?raw'

it('', () => {
  const { astResult, stringResult } = parseThenStringify(content, field)
  expect(stringResult.trim()).toEqual(content.trim())
  if (out) {
    expect(astResult).toEqual(outString)
  } else {
    writeSnapshot(astResult)
  }
})
