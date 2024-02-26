import {
  createDatabase,
  createLocalDatabase,
} from '@strivemath/tinacms-datalayer'
import { MongodbLevel } from 'mongodb-level'
import { GitHubProvider } from 'tinacms-gitprovider-github'

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
        collectionName: '@strivemath/tinacms',
        dbName: '@strivemath/tinacms',
        mongoUri: process.env.MONGODB_URI,
      }),
      namespace: process.env.GITHUB_BRANCH,
    })
