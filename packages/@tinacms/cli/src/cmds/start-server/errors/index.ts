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

import { logger } from '../../../logger'
import { dangerText } from '../../../utils/theme'
import { handleFetchErrorError, TinaFetchError } from '@tinacms/graphql'

export class BuildSchemaError extends Error {
  constructor(message) {
    super(message)
    this.name = 'BuildSchemaError'
  }
}

export class ExecuteSchemaError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ExecuteSchemaError'
  }
}

export const handleServerErrors = (e: Error) => {
  if (e.name === 'BuildSchemaError') {
    logger.error(`${dangerText(
      'ERROR: your schema was not successfully built: see https://tina.io/docs/errors/esbuild-error/ for more details'
    )}
  Error Message Below
  ${e}`)
  } else if (e.name === 'ExecuteSchemaError') {
    logger.error(`${dangerText(
      'ERROR: your schema was not successfully executed: see https://tina.io/docs/errors/esbuild-error/ for more details'
    )}
  Error Message Below
  ${e}`)
  } else if (e.name === 'TinaSchemaValidationError') {
    logger.error(`${dangerText(
      'ERROR: your schema was not successfully validated: see https://tina.io/docs/schema/ for instructions on how to setup a schema'
    )}
  Error Message Below
  ${e}`)
  } else if (e instanceof TinaFetchError) {
    handleFetchErrorError(e, true)
  } else {
    logger.info(
      dangerText(
        'Compilation failed with errors. Server has not been restarted.'
      ) + ` see error below \n ${e.message}`
    )
  }
}
