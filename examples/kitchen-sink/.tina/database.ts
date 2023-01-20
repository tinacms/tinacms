import { createDatabase } from '@tinacms/graphql'
// @ts-ignore types weren't published properly
import { MongodbLevel } from 'mongodb-level'
import { ClassicLevel } from 'classic-level'
import { config } from 'dotenv'
import fs from 'fs'

config()

const level = new MongodbLevel({
  mongoUri: process.env.MONGO_URI,
  dbName: 'tinacms',
  collectionName: 'tinacms',
})
const level2 = new ClassicLevel('./.tina/__generated__/a')

export default createDatabase({
  level: process.env.MY_TINA_DEV === 'local' ? level2 : level,
  onPut: async (key, value) => {
    console.log('onPut', key)
    await fs.writeFileSync(key, value)
  },
  onDelete: async (key) => {
    console.log('deleteing', key)
    await fs.unlinkSync(key)
  },
})
