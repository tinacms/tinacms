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

import { createDatabase, resolve } from '@tinacms/graphql'

import { FilesystemBridge, FilesystemStore } from '@tinacms/datalayer'
import { auditCollection, auditDocuments } from './audit'

const rootPath = process.cwd()

export const audit = async (ctx: any, next: () => void, options) => {
  const bridge = new FilesystemBridge(rootPath)
  const store = new FilesystemStore({ rootPath })
  const database = await createDatabase({ store, bridge })
  const schema = await database.getSchema()
  const collections = schema.getCollections()

  for (let i = 0; i < collections.length; i++) {
    const collection = collections[i]
    await auditCollection({ collection, database, rootPath })
    await auditDocuments({ collection, database, rootPath })
  }

  next()
  //validate the result
}
