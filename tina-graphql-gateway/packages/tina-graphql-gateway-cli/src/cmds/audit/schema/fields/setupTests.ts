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

import { validator } from '../validator'
import { validateFile } from '../../index'
import { ForestryFMTSchema } from '../fmt'

/**
 * The idea with these test are that you can provide 3 keys (initial, error, fixed).
 *
 * Initial is the setup
 *
 * Error is the expectation for what kind of error we'll get. If no errors are expected you can omit this key
 *
 * Fixed is the result if the error can be fixed automatically, if it can't be fixed
 * this value should be left off.
 */

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeUnsuccessful(): R
      toBeSuccessful(): R
    }
  }
}

expect.extend({
  toBeSuccessful(received) {
    const pass = received.success
    if (pass) {
      return {
        message: () => `response was successful`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected to be able to fix data but there were still errors`,
        pass: false,
      }
    }
  },
  toBeUnsuccessful(received) {
    const pass = !received.success
    if (pass) {
      return {
        message: () => `response was unsuccessful`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected response to be unsuccessful`,
        pass: false,
      }
    }
  },
})

// To see console.log disable this
jest.spyOn(console, 'log').mockImplementation()
export const setupTests = (example) => {
  Object.keys(example).map((item) => {
    const ajv = validator({ fix: true })
    const ajvWithErrors = validator({ fix: false })
    const { initial, fixed, errors } = example[item]
    describe(`The ${initial.type} field`, () => {
      describe(item, () => {
        const payload = {
          label: 'my-fmt',
          hide_body: false,
          fields: [initial],
        }

        describe('when run as a fix/migrate task', () => {
          if (fixed) {
            test(`can be fixed/migrated`, async () => {
              const output = await validateFile({
                filePath: 'my-path.yml',
                payload,
                schema: ForestryFMTSchema,
                ajv,
                fix: true,
              })
              expect(output).toBeSuccessful()
              expect(output.fileJSON.fields[0]).toEqual(fixed)
            })
          } else {
            test(`cannot be fixed/migrated`, async () => {
              const output = await validateFile({
                filePath: 'my-path.yml',
                payload,
                schema: ForestryFMTSchema,
                ajv,
                fix: true,
              })
              expect(output).toBeUnsuccessful()
            })
          }
        })
        describe('when run as an audit task', () => {
          if (errors?.length > 0) {
            test(`returns expected errors: \n            ${errors
              .map(({ dataPath, keyword }) => `field${dataPath}: ${keyword}`)
              .join('\n            ')}`, async () => {
              const outputWithErrors = await validateFile({
                filePath: 'my-path.yml',
                payload,
                schema: ForestryFMTSchema,
                ajv: ajvWithErrors,
                fix: false,
              })

              const errorKeys = outputWithErrors.errors
              const errorList = errorKeys.map(({ dataPath, keyword }) => {
                return {
                  dataPath: dataPath.replace('.fields[0]', ''),
                  keyword,
                }
              })

              expect(errorList).toEqual(
                errors.map(({ dataPath, keyword }) => {
                  return { dataPath: `${dataPath}`, keyword }
                })
              )
            })
          } else {
            test('has no errors', async () => {
              const outputWithErrors = await validateFile({
                filePath: 'my-path.yml',
                payload,
                schema: ForestryFMTSchema,
                ajv: ajvWithErrors,
                fix: false,
              })

              expect(outputWithErrors.errors).toEqual([])
            })
          }
        })
      })
    })
  })
}
