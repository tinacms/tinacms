/*
The "Init" command.
This init command is a simple setup command that gets a user up and running locally.
*/

import { logger } from '../../logger'
import detectEnvironment from './detectEnvironment'
import configure from './configure'
import { CLICommand } from '../index'
import apply from './apply'
import { Config } from './prompts'

export interface Framework {
  name: 'next' | 'hugo' | 'jekyll' | 'other'
  reactive: boolean
}

export type ReactiveFramework = 'next'

export type GeneratedFileType =
  | 'next-api-handler'
  | 'config'
  | 'database'
  | 'templates'
  | 'reactive-example'
  | 'sample-content'
  | 'users-json'

export type GeneratedFile = {
  fullPathJS: string
  fullPathTS: string
  fullPathOverride?: string
  generatedFileType: GeneratedFileType
  name: string
  parentPath: string
  typescriptExists: boolean
  javascriptExists: boolean
  resolve: (typescript: boolean) => {
    exists: boolean
    path: string
    parentPath: string
  }
}

export type FrontmatterFormat = 'yaml' | 'toml' | 'json'

export type InitEnvironment = {
  hasTinaDeps: boolean
  forestryConfigExists: boolean
  frontMatterFormat: FrontmatterFormat
  gitIgnoreExists: boolean
  gitIgnoreNodeModulesExists: boolean
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
  ): Promise<Config> {
    return configure(env, { debug, isBackend: isBackendInit })
  },
  apply(
    config: Config,
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
