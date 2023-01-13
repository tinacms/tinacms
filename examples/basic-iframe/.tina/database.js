import { createDatabase } from '@tinacms/graphql'
import { FilesystemBridge } from '@tinacms/datalayer'
import { MongodbLevel } from 'mongodb-level'
import { config } from 'dotenv'

config()

const level = new MongodbLevel({
  mongoUri: process.env.MONGO_URI,
  dbName: 'tinacms',
  collectionName: 'tinacms',
})

export default createDatabase({
  bridge: new FilesystemBridge(process.cwd()),
  level,
})
