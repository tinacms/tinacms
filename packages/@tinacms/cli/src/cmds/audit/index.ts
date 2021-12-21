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
