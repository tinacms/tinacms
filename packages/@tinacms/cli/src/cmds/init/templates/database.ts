import type { Config } from '../prompts';
import { makeImportString } from '../prompts';

export type Variables = {
  isLocalEnvVarName: string;
};

export type DatabaseAdapterTypes = 'upstash-redis';

export const databaseTemplate = ({ config }: { config: Config }) => {
  return `
import { createDatabase, createLocalDatabase } from '@tinacms/datalayer'
${makeImportString(config.gitProvider?.imports)}
${makeImportString(config.databaseAdapter?.imports)}

const branch = (process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main")

const isLocal =  process.env.${config.isLocalEnvVarName} === 'true'

export default isLocal
  ? createLocalDatabase()
  : createDatabase({
      gitProvider: ${config.gitProvider?.gitProviderClassText},
      databaseAdapter: ${config.databaseAdapter?.databaseAdapterClassText},
      namespace: branch,
      // Users who can add, edit, or remove users in the admin.
      // The built-in login is not production grade. Use a dedicated auth provider in production.
      authCollection: { admins: ['tinauser'] },
    })
`;
};
