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

import type { TinaSchema } from '../primitives/schema'
import { NAMER } from '../primitives/ast-builder'

export const buildSKD = (tinaSchema: TinaSchema) => {
  const methods = tinaSchema.getCollections().map((collection) => {
    const queryName = NAMER.queryName(collection.namespace)
    const listQueryName = NAMER.generateQueryListName(collection.namespace)
    return `public ${queryName}(args: { relativePath: string }) {
        // const name = 'getAuthorDocument'
        // this._usedFrags.push(name)
        // const currentFrag = {
        //   ...this._frags[name],
        //   arguments: genArgs(args),
        // }
        // this._selections.push(currentFrag)
        return this
      }
  public ${listQueryName}(args: {}) {
    // const name = 'getAuthorDocument'
    // this._usedFrags.push(name)
    // const currentFrag = {
    //   ...this._frags[name],
    //   arguments: genArgs(args),
    // }
    // this._selections.push(currentFrag)
    return this
  }
  `
  })

  return `export class TinaGQLClient {
  ${methods.join('\n')}      
}`
}
