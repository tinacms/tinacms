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

import { ZodError } from 'zod'
import { TinaCloudSchema } from '../types'
import { TinaCloudSchemaZod } from './schema'
export const validateSchema = ({
  config,
}: {
  config: TinaCloudSchema<false>
}) => {
  try {
    TinaCloudSchemaZod.parse(config)
  } catch (e) {
    if (e instanceof ZodError) {
      const errors = e.flatten((issue) => {
        const moreInfo = []
        if (issue.code === 'invalid_union') {
          // TODO: should probably change this to be a recursive function that iterates over the entire nested error object instead of just one level deep
          moreInfo.push(issue.unionErrors.map((x) => x.flatten()))
        }
        return {
          message: issue.message,
          code: issue.code || 'no code provided',
          path: issue.path.join('.'),
          moreInfo,
        }
      })
      console.error(
        '!!! Error when trying to validate `.tina/schema file`!!!,\n' +
          JSON.stringify(errors, null, 2)
      )
    }
    throw e
  }
}
