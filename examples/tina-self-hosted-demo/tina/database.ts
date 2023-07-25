import {
  createDatabase,
  createLocalDatabase,
  GitHubProvider,
} from '@tinacms/datalayer'
import { MongodbLevel } from 'mongodb-level'

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: new GitHubProvider({
        branch: process.env.GITHUB_BRANCH,
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      }),
      databaseAdapter: new MongodbLevel<string, Record<string, any>>({
        collectionName: process.env.GITHUB_BRANCH,
        dbName: 'tinacms',
        mongoUri: process.env.MONGODB_URI,
      }),
    })
