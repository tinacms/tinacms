import {
  createDatabase,
  createLocalDatabase,
  GitHubProvider,
} from '@tinacms/datalayer'
import { MongodbLevel } from 'mongodb-level'

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

const owner = process.env.GITHUB_OWNER as string
const repo = process.env.GITHUB_REPO as string
const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN as string
const branch = process.env.GITHUB_BRANCH as string
const mongoUri = process.env.MONGODB_URI as string

const adapter = new MongodbLevel<string, Record<string, any>>({
  collectionName: branch,
  dbName: 'tina-test',
  mongoUri,
})

const gitProvider = new GitHubProvider({ branch, owner, repo, token })

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: gitProvider,
      databaseAdapter: adapter,
    })
