import { describe, expect, it } from 'vitest'
import { field, parseMDX, stringifyMDX } from './_config'
import { setupNewTests, writeTestFile } from '../setup'

const content = import.meta.glob('./*.md', { as: 'raw' })
const outputString = import.meta.glob('./*.ts', { as: 'raw' })

setupNewTests(content, outputString, ({ name, markdownContent }) => {
  describe(`setting up ${name}`, () => {
    it(`verifies that stringifying the parsed output will match the original string`, async () => {
      const markdownString = await markdownContent()
      const astResult = parseMDX(markdownString, field, (v) => v)
      expect(stringifyMDX(astResult, field, (v) => v)).toEqual(markdownString)
      // If `expect` doesn't throw, save the file
      writeTestFile(__dirname, name, astResult)
    })
  })
})

it(`true is true`, () => {
  expect(true).toBe(true)
})
