import { Framework } from '../'

export type Config = {
  typescript: boolean
  publicFolder?: string
  framework: Framework
  packageManager: 'pnpm' | 'yarn' | 'npm'
  forestryMigrate: boolean
  frontMatterFormat?: 'yaml' | 'toml' | 'json'
  hosting?: 'tina-cloud' | 'self-host'
  gitProvider?: PromptGitProvider
  databaseAdapter?: PromptDatabaseAdapter
  authenticationProvider?: PromptAuthenticationProvider
  nextAuthCredentialsProviderName?: string
  isLocalEnvVarName: string
  envVars: { key: string; value: string }[]
  overwriteList?: string[]
}
export interface ImportStatement {
  imported: string[]
  from: string
  packageName: string
}

export interface PromptGitProvider {
  gitProviderClassText: string
  imports?: ImportStatement[]
}

export interface PromptDatabaseAdapter {
  databaseAdapterClassText: string
  imports?: ImportStatement[]
}
export interface PromptAuthenticationProvider {
  name: string
  // For tina/config file
  configAuthenticationClass?: string
  configImports?: ImportStatement[]
  // for /api/tina/[...routes] file
  backendAuthentication?: string
  backendAuthenticationImports?: ImportStatement[]
  peerDependencies?: string[]
}
