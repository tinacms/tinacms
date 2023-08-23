/*
The "Init" command.
This init command is a simple setup command that gets a user up and running locally.
*/

import { logger } from '../../logger'
import detectEnvironment from './detectEnvironment'
import configure from './configure'
import { CLICommand } from '../index'
import apply from './apply'

export interface Framework {
  name: 'next' | 'hugo' | 'jekyll' | 'other'
  reactive: boolean
}

type GeneratedFileType =
  | 'auth'
  | 'config'
  | 'database'
  | 'templates'
  | 'vercel-kv-credentials-provider-signin'
  | 'vercel-kv-credentials-provider-register'
  | 'vercel-kv-credentials-provider-tailwindcss'
  | 'vercel-kv-credentials-provider-register-api-handler'
  | 'next-auth-api-handler'
  | 'gql-api-handler'
  | 'tina.svg'

export type GeneratedFile = {
  fullPathJS: string
  fullPathTS: string
  name: string
  parentPath: string
  typescriptExists: boolean
  javascriptExists: boolean
  resolve: (boolean) => { exists: boolean; path: string; parentPath: string }
}

export type InitEnvironment = {
  forestryConfigExists: boolean
  frontMatterFormat: 'yaml' | 'toml' | 'json'
  gitIgnoreExists: boolean
  gitIgoreNodeModulesExists: boolean
  gitIgnoreTinaEnvExists: boolean
  gitIgnoreEnvExists: boolean
  nextAppDir: boolean
  packageJSONExists: boolean
  sampleContentExists: boolean
  sampleContentPath: string
  generatedFiles?: {
    [key in GeneratedFileType]: GeneratedFile
  }
  usingSrc: boolean
  tinaConfigExists: boolean
}

export type InitParams = {
  rootPath: string
  pathToForestryConfig: string
  noTelemetry: boolean
  isBackendInit: boolean
  baseDir?: string
  debug?: boolean
  tinaVersion?: string
}

export const command = new CLICommand<InitEnvironment, InitParams>({
  async setup(params: InitParams): Promise<void> {
    logger.level = 'info'
    process.chdir(params.rootPath)
  },
  detectEnvironment({
    rootPath,
    pathToForestryConfig,
    baseDir = '',
    debug = false,
    tinaVersion,
  }: InitParams): Promise<InitEnvironment> {
    return detectEnvironment({
      baseDir,
      pathToForestryConfig,
      rootPath,
      debug,
      tinaVersion,
    })
  },
  configure(
    env: InitEnvironment,
    { debug = false, isBackendInit = false }: InitParams
  ): Promise<Record<any, any>> {
    return configure(env, { debug, isBackend: isBackendInit })
  },
  apply(
    config: Record<any, any>,
    env: InitEnvironment,
    params: InitParams
  ): Promise<void> {
    return apply({
      env,
      params,
      config,
    })
  },
})
