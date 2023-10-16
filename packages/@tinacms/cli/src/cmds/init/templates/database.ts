import type { Config } from '../prompts'
import { makeImportString } from '../prompts'

export type Variables = {
  isLocalEnvVarName: string
}

export type DatabaseAdapterTypes = 'upstash-redis'

export const databaseTemplate = ({ config }: { config: Config }) => {
  return `
import { createDatabase, createLocalDatabase } from '@tinacms/datalayer'
${makeImportString(config.gitProvider.imports)}

const branch = (process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main")

const isLocal =  process.env.${config.isLocalEnvVarName} === 'true'

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: ${config.gitProvider.gitProviderClassText},
      databaseAdapter: ${config.databaseAdapter.databaseAdapterClassText},
      namespace: branch,
    })
`
}
