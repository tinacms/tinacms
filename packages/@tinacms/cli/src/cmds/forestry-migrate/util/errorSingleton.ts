/**

*/

import { logger } from '../../../logger'
import { dangerText, linkText } from '../../../utils/theme'

interface NameError {
  name: string
  template: string
  newName: string
}

/**
 * The Singleton class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */
export class ErrorSingleton {
  private static instance: ErrorSingleton

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): ErrorSingleton {
    if (!ErrorSingleton.instance) {
      ErrorSingleton.instance = new ErrorSingleton()
      ErrorSingleton.instance.collectionNameErrors = []
    }

    return ErrorSingleton.instance
  }

  private collectionNameErrors: NameError[]

  public addErrorName(error: NameError) {
    this.collectionNameErrors.push(error)
  }
  public printCollectionNameErrors() {
    if (this.collectionNameErrors?.length) {
      logger.error(
        dangerText('ERROR: TinaCMS only supports alphanumeric template names')
      )
      logger.error('The following templates have been renamed:')
      this.collectionNameErrors.forEach((error) => {
        logger.error(`- ${error.template}.yaml -> ${error.newName}`)
      })
      logger.error(
        `If you wish to edit any of the following templates, you will have to update your content and code to use the new name. See ${linkText(
          'https://tina.io/docs/forestry/common-errors/#migrating-fields-with-non-alphanumeric-characters'
        )} for more information.`
      )
    }
  }
}
