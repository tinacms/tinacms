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
import { parseZodError } from '../util/parseZodErrors'
import { TinaCloudSchemaZod } from './schema'

export { validateTinaCloudSchemaConfig } from './tinaCloudSchemaConfig'

export class TinaSchemaValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'TinaSchemaValidationError'
  }
}

export const validateSchema = ({
  config,
}: {
  config: TinaCloudSchema<false>
}) => {
  try {
    TinaCloudSchemaZod.parse(config)
  } catch (e) {
    if (e instanceof ZodError) {
      const errors = parseZodError({ zodError: e })
      throw new TinaSchemaValidationError(errors.join(', \n'))
    } else {
      throw new Error(e)
    }
  }
}
