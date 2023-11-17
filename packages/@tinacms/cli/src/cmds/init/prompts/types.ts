import { Framework, GeneratedFileType } from '../'

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
  authProvider?: PromptAuthProvider
  nextAuthCredentialsProviderName?: string
  isLocalEnvVarName: string
  envVars: { key: string; value: string }[]
  overwriteList?: GeneratedFileType[]
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
export interface PromptAuthProvider {
  name: string
  // For tina/config file
  configAuthProviderClass?: string
  configImports?: ImportStatement[]
  extraTinaCollections?: string[]
  // for /api/tina/[...routes] file
  backendAuthProvider?: string
  backendAuthProviderImports?: ImportStatement[]
  peerDependencies?: string[]
}
