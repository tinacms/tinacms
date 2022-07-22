/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as _ from 'lodash'
import { BuildSchemaError, ExecuteSchemaError } from '../start-server/errors'
import fs from 'fs-extra'
import path from 'path'
import { build } from 'esbuild'
import type { Loader } from 'esbuild'
import type { TinaCloudSchema } from '@tinacms/graphql'
import { dangerText, logText } from '../../utils/theme'
import { defaultSchema } from './defaultSchema'
import { getSchemaPath, getClientPath } from '../../lib'
import { logger } from '../../logger'

export const resetGeneratedFolder = async ({
  tinaGeneratedPath,
}: {
  tinaGeneratedPath: string
}) => {
  try {
    await fs.rm(tinaGeneratedPath, {
      recursive: true,
    })
  } catch (e) {
    console.log(e)
  }
  await fs.mkdir(tinaGeneratedPath)
  // temp types file to allows the client to build
  await fs.writeFile(
    path.join(tinaGeneratedPath, 'types.ts'),
    `
export const queries = (client)=>({})
`
  )
  await fs.writeFile(
    path.join(tinaGeneratedPath, 'client.ts'),
    `
export const client = {}
`
  )
  await fs.outputFile(
    path.join(tinaGeneratedPath, '.gitignore'),
    `db
client.ts
types.ts
frags.gql
queries.gql
schema.gql
`
  )
}

// Cleanup function that is guaranteed to run
const cleanup = async ({ tinaTempPath }: { tinaTempPath: string }) => {
  await fs.remove(tinaTempPath)
}

export const compileClient = async (
  ctx,
  next,
  options: { clientFileType?: string; verbose?: boolean; dev?: boolean }
) => {
  const root = ctx.rootPath
  if (!root) {
    throw new Error('ctx.rootPath has not been attached')
  }
  const tinaPath = path.join(root, '.tina')

  const tinaGeneratedPath = path.join(tinaPath, '__generated__')
  const packageJSONFilePath = path.join(root, 'package.json')

  const tinaTempPath = path.join(tinaGeneratedPath, 'temp_client')

  if (!options.clientFileType) options = { ...options, clientFileType: 'ts' }

  if (options.verbose) {
    logger.info(logText('Compiling Client...'))
  }

  const { clientFileType: requestedClientFileType = 'ts' } = options
  const allowedFileTypes = ['ts', 'js']

  if (allowedFileTypes.includes(requestedClientFileType) === false) {
    throw new Error(
      `Requested schema file type '${requestedClientFileType}' is not valid. Supported schema file types: 'ts, js'`
    )
  }

  if (ctx) {
    ctx.clientFileType = requestedClientFileType
  }

  let clientExists = true
  const projectDir = path.join(tinaPath, '__generated__')
  try {
    getClientPath({ projectDir })
  } catch {
    clientExists = false
  }

  // TODO: Do we want to introduce a `defaultClient()` like we do with `defaultSchema()`?
  if (!clientExists) {
    // The client.ts file does not exist
    if (options.verbose) {
      logger.info(
        logText(
          `.tina/client.${requestedClientFileType} not found, skipping compile client...`
        )
      )
    }
    return next()
  }

  try {
    const define = {}
    if (!process.env.NODE_ENV) {
      define['process.env.NODE_ENV'] = options.dev
        ? '"development"'
        : '"production"'
    }
    const inputFile = getClientPath({
      projectDir,
    })
    await transpile(
      inputFile,
      'client.js',
      tinaTempPath,
      options.verbose,
      define,
      packageJSONFilePath
    )
  } catch (e) {
    await cleanup({ tinaTempPath })
    throw new BuildSchemaError(e)
  }

  // Delete the node require cache for .tina temp folder
  Object.keys(require.cache).map((key) => {
    if (key.startsWith(tinaTempPath)) {
      delete require.cache[require.resolve(key)]
    }
  })

  try {
    const clientFunc = require(path.join(tinaTempPath, 'client.js'))
    const client = clientFunc.default

    ctx.client = client

    await cleanup({ tinaTempPath })
  } catch (e) {
    // Always remove the temp code
    await cleanup({ tinaTempPath })

    // Keep TinaSchemaValidationErrors around
    if (e instanceof Error) {
      if (e.name === 'TinaSchemaValidationError') {
        throw e
      }
    }

    // Throw an execution error
    throw new ExecuteSchemaError(e)
  }

  return next()
}

export const compileSchema = async (
  ctx,
  _next,
  options: { schemaFileType?: string; verbose?: boolean; dev?: boolean }
) => {
  const root = ctx.rootPath
  if (!root) {
    throw new Error('ctx.rootPath has not been attached')
  }
  const tinaPath = path.join(root, '.tina')
  const tinaGeneratedPath = path.join(tinaPath, '__generated__')
  const tinaTempPath = path.join(tinaGeneratedPath, 'temp_schema')
  const tinaConfigPath = path.join(tinaGeneratedPath, 'config')
  const packageJSONFilePath = path.join(root, 'package.json')

  if (!options.schemaFileType) options = { ...options, schemaFileType: 'ts' }

  if (options.verbose) {
    logger.info(logText('Compiling Schema...'))
  }

  const { schemaFileType: requestedSchemaFileType = 'ts' } = options

  const schemaFileType =
    ((requestedSchemaFileType === 'ts' || requestedSchemaFileType === 'tsx') &&
      'ts') ||
    ((requestedSchemaFileType === 'js' || requestedSchemaFileType === 'jsx') &&
      'js')

  if (!schemaFileType) {
    throw new Error(
      `Requested schema file type '${requestedSchemaFileType}' is not valid. Supported schema file types: 'ts, js, tsx, jsx'`
    )
  }

  if (ctx) {
    ctx.schemaFileType = schemaFileType
  }

  let schemaExists = true
  try {
    getSchemaPath({ projectDir: tinaPath })
  } catch {
    // getSchemaPath will throw an error if it is not found
    schemaExists = false
  }
  if (!schemaExists) {
    // The schema.ts file does not exist
    logger.info(
      dangerText(`
      .tina/schema.${schemaFileType} not found, Creating one for you...
      See Documentation: https://tina.io/docs/tina-cloud/cli/#getting-started"
      `)
    )
    // We will default to TS?
    const file = path.join(tinaPath, `schema.${schemaFileType}`)
    // Ensure there is a .tina/schema.ts file
    await fs.ensureFile(file)
    // Write a basic schema to it
    await fs.writeFile(file, defaultSchema)
  }

  // Turns the schema into JS files so they can be run
  try {
    const define = {}
    if (!process.env.NODE_ENV) {
      define['process.env.NODE_ENV'] = options.dev
        ? '"development"'
        : '"production"'
    }
    const inputFile = getSchemaPath({ projectDir: tinaPath })
    await transpile(
      inputFile,
      'schema.js',
      tinaTempPath,
      options.verbose,
      define,
      packageJSONFilePath
    )
  } catch (e) {
    await cleanup({ tinaTempPath })
    throw new BuildSchemaError(e)
  }

  // Delete the node require cache for .tina temp folder
  Object.keys(require.cache).map((key) => {
    if (key.startsWith(tinaTempPath)) {
      delete require.cache[require.resolve(key)]
    }
  })

  try {
    const schemaFunc = require(path.join(tinaTempPath, 'schema.js'))
    const schemaObject: TinaCloudSchema = schemaFunc.default
    ctx.schema = schemaObject
    await fs.outputFile(
      path.join(tinaConfigPath, 'schema.json'),
      JSON.stringify(schemaObject, null, 2)
    )
    await cleanup({ tinaTempPath })
  } catch (e) {
    // Always remove the temp code
    await cleanup({ tinaTempPath })

    // Keep TinaSchemaValidationErrors around
    if (e instanceof Error) {
      if (e.name === 'TinaSchemaValidationError') {
        throw e
      }
    }

    // Throw an execution error
    throw new ExecuteSchemaError(e)
  }
}

const transpile = async (
  inputFile,
  outputFile,
  tempDir,
  verbose,
  define,
  packageJSONFilePath: string
) => {
  if (verbose) logger.info(logText('Building javascript...'))

  const packageJSON = JSON.parse(
    fs.readFileSync(packageJSONFilePath).toString() || '{}'
  )
  const deps = packageJSON?.dependencies || []
  const peerDeps = packageJSON?.peerDependencies || []
  const devDeps = packageJSON?.devDependencies || []
  const external = Object.keys({ ...deps, ...peerDeps, ...devDeps })

  const outputPath = path.join(tempDir, outputFile)
  await build({
    bundle: true,
    platform: 'neutral',
    target: ['node10.4'],
    entryPoints: [inputFile],
    treeShaking: true,
    external: [...external, './node_modules/*'],
    loader: loaders,
    outfile: outputPath,
    define: define,
  })
  if (verbose) logger.info(logText(`Javascript built`))
}

export const defineSchema = (config: TinaCloudSchema) => {
  return config
}

const loaders: { [ext: string]: Loader } = {
  '.aac': 'file',
  '.css': 'file',
  '.eot': 'file',
  '.flac': 'file',
  '.gif': 'file',
  '.jpeg': 'file',
  '.jpg': 'file',
  '.json': 'json',
  '.mp3': 'file',
  '.mp4': 'file',
  '.ogg': 'file',
  '.otf': 'file',
  '.png': 'file',
  '.svg': 'file',
  '.ttf': 'file',
  '.wav': 'file',
  '.webm': 'file',
  '.webp': 'file',
  '.woff': 'file',
  '.woff2': 'file',
  '.js': 'jsx',
  '.jsx': 'jsx',
  '.tsx': 'tsx',
}
