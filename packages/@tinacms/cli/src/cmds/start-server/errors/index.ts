/**

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
    logger.info(dangerText(`Compilation failed with errors:\n${e.message}`))
  }
}
