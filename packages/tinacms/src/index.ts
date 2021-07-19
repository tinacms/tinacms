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

export * from './client'
export * from './auth'
export * from './utils'
export * from './tina-cms'
export { useDocumentCreatorPlugin } from './hooks/use-content-creator'
export { useGraphqlForms } from './hooks/use-graphql-forms'
import { TinaCMSProvider2 } from './tina-cms'

export default TinaCMSProvider2

/**
 * A passthru function which allows editors
 * to know the temlpate string is a GraphQL
 * query or muation
 */
function graphql(strings: TemplateStringsArray) {
  return strings[0]
}
export { graphql }

export * from '@tinacms/toolkit'
