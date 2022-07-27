/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
import { describe, expect, it } from 'vitest'
import { field, parseMDX, stringifyMDX } from './_config'
import { setupNewTests, writeAutoformatFile, writeTestFile } from '../setup'

const content = import.meta.glob('./*.md', { as: 'raw' })
const outputString = import.meta.glob('./*.ts', { as: 'raw' })

setupNewTests(content, outputString, ({ name, markdownContent }) => {
  describe(`setting up ${name}`, () => {
    it(`verifies that stringifying the parsed output will match the original string`, async () => {
      const markdownString = await markdownContent()
      const astResult = parseMDX(markdownString, field, (v) => v)
      const stringResult = stringifyMDX(astResult, field, (v) => v)
      try {
        expect(stringResult).toEqual(markdownString)
        // If `expect` doesn't throw, save the file
        writeTestFile(__dirname, name, astResult)
      } catch (e) {
        if (name.startsWith('./autoformat')) {
          writeTestFile(__dirname, name, astResult, true)
          writeAutoformatFile(__dirname, name, String(stringResult))
        } else {
          throw e
        }
      }
    })
  })
})

it(`true is true`, () => {
  expect(true).toBe(true)
})
