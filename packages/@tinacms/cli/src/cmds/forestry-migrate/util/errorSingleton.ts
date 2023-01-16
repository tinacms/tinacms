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
      ErrorSingleton.instance.allErrorNames = []
    }

    return ErrorSingleton.instance
  }

  private allErrorNames: NameError[]

  public addErrorName(error: NameError) {
    this.allErrorNames.push(error)
  }
  public printErrorNames() {
    logger.error(
      dangerText('ERROR: TinaCMS only supports alphanumeric field names')
    )
    logger.error(
      `If you wish to edit any of the following fields or template names you will have to update your content and code to use the new name. See ${linkText(
        'https://tina.io/docs/forestry/common-errors/#migrating-fields-with-non-alphanumeric-characters'
      )} for more information.`
    )
    logger.error('The following template and field names have been renamed:`')
    this.allErrorNames.forEach((error) => {
      logger.error(
        `- Content that uses ${error.template}.yaml: ${error.name} -> ${error.newName}`
      )
    })

    // logger.error(
    //   `${dangerText(
    //     `Name, "${name}" used in Frontmatter template "${template}.yaml" must be alphanumeric and can only contain underscores.`
    //   )}\n "${name}" will be updated to ${newName} in  TinaCMS if you wish to edit attribute ${name} you will have to update your content and code to use ${newName} instead. See ${linkText(
    //     'https://tina.io/docs/forestry/common-errors/#migrating-fields-with-non-alphanumeric-characters'
    //   )} for more information.`
    // )
  }
}
