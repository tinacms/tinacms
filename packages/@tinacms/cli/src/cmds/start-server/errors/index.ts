import { logger } from '../../../logger'
import { dangerText } from '../../../utils/theme'

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
  if (e instanceof BuildSchemaError) {
    logger.error(`${dangerText(
      'ERROR: your schema was not successfully build: see https://tina.io/docs/errors/esbuild-error/ for more details'
    )}
  Error Message Below
  ${e}`)
  } else if (e instanceof ExecuteSchemaError) {
    logger.error(`${dangerText(
      'ERROR: your schema was not successfully executed: see https://tina.io/docs/errors/esbuild-error/ for more details'
    )}
  Error Message Below
  ${e}`)
  } else {
    logger.info(
      dangerText(
        'Compilation failed with errors. Server has not been restarted.'
      ) + ` see error below \n ${e.message}`
    )
  }
}
