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
import { getClientPath, getPath } from '../../lib'
import { logger } from '../../logger'

export const resetGeneratedFolder = async ({
  tinaGeneratedPath,
  usingTs,
}: {
  tinaGeneratedPath: string
  usingTs: boolean
}) => {
  try {
    await fs.emptyDir(tinaGeneratedPath)
  } catch (e) {
    console.log(e)
  }
  await fs.mkdirp(tinaGeneratedPath)
  const ext = usingTs ? 'ts' : 'js'
  // temp types file to allows the client to build
  await fs.writeFile(
    path.join(tinaGeneratedPath, `types.${ext}`),
    `
export const queries = (client)=>({})
`
  )
  await fs.writeFile(
    path.join(tinaGeneratedPath, `client.${ext}`),
    `
export const client = ()=>{}
export default client
`
  )
  await fs.outputFile(
    path.join(tinaGeneratedPath, '.gitignore'),
    `db
client.ts
client.js
types.ts
types.js
types.d.ts
frags.gql
queries.gql
schema.gql
out.jsx
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

export const compileFile = async (
  options: {
    schemaFileType?: string
    verbose?: boolean
    dev?: boolean
    rootPath: string
  },
  fileName: string
) => {
  const root = options.rootPath
  if (!root) {
    throw new Error('ctx.rootPath has not been attached')
  }
  const tinaPath = path.join(root, '.tina')
  const tsConfigPath = path.join(root, 'tsconfig.json')
  const tinaGeneratedPath = path.join(tinaPath, '__generated__')
  const tinaTempPath = path.join(tinaGeneratedPath, `temp_${fileName}`)
  const packageJSONFilePath = path.join(root, 'package.json')

  if (!options.schemaFileType) {
    const usingTs = await fs.pathExists(tsConfigPath)
    // default schema file type is based on the existence of a tsconfig.json
    options = { ...options, schemaFileType: usingTs ? 'ts' : 'js' }
  }

  if (options.verbose) {
    logger.info(logText(`Compiling ${fileName}...`))
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

  let schemaExists = true
  try {
    getPath({
      projectDir: tinaPath,
      filename: fileName,
      allowedTypes: ['js', 'jsx', 'tsx', 'ts'],
      errorMessage: `Must provide a ${fileName}.{js,jsx,tsx,ts}`,
    })
  } catch {
    // getSchemaPath will throw an error if it is not found
    schemaExists = false
  }
  // TODO: refactor this
  if (!schemaExists && fileName === 'schema') {
    // The schema.ts file does not exist
    logger.info(
      dangerText(`
      .tina/schema.${schemaFileType} not found, Creating one for you...
      See Documentation: https://tina.io/docs/tina-cloud/cli/#getting-started"
      `)
    )
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
    const inputFile = getPath({
      projectDir: tinaPath,
      filename: fileName,
      allowedTypes: ['js', 'jsx', 'tsx', 'ts'],
      errorMessage: `Must provide a ${fileName}.{js,jsx,tsx,ts}`,
    })
    await transpile(
      inputFile,
      `${fileName}.js`,
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
  let returnObject = {}

  try {
    const schemaFunc = require(path.join(tinaTempPath, `${fileName}.js`))
    returnObject = schemaFunc.default
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
  return returnObject
}

export const compileSchema = async (options: {
  schemaFileType?: string
  verbose?: boolean
  dev?: boolean
  rootPath
}) => {
  const root = options.rootPath
  const tinaPath = path.join(root, '.tina')
  const tinaGeneratedPath = path.join(tinaPath, '__generated__')
  const tinaConfigPath = path.join(tinaGeneratedPath, 'config')

  let schema: any = await compileFile(options, 'schema')
  try {
    const config = (await compileFile(options, 'config')) as any
    const configCopy = _.cloneDeep(config)
    delete configCopy.schema
    if (config?.schema) {
      // Merge the schema with the config to maintain backwards compatibility
      // EX: {collections: [], config: {...}}
      schema = { ...config.schema, config: configCopy }
    }
  } catch (e) {
    // Do nothing, they are not using a config file
  }
  await fs.outputFile(
    path.join(tinaConfigPath, `schema.json`),
    JSON.stringify(schema, null, 2)
  )

  return schema
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

  /**
   * Pre build into an temporary file so we can respect the user's
   * tsconfig (eg. `baseUrl` and `jsx` arguments). We'll then
   * use this file with a custom (empty) tsconfig to ensure
   * we don't get any unexpected behavior.
   *
   * Note that for `viteBuild` we'll want to do something similar as
   * it will be unable to find modules if a user's tsconfig has a `baseurl`
   * configuration.
   */
  const prebuiltInputPath = path.join(tempDir, 'temp-output.jsx')
  await build({
    bundle: true,
    platform: 'neutral',
    target: ['es2020'],
    entryPoints: [inputFile],
    treeShaking: true,
    external: [...external, './node_modules/*'],
    loader: loaders,
    outfile: prebuiltInputPath,
    define: define,
  })

  /**
   * Fake the tsconfig so the `"jsx": "preserve"` setting doesn't
   * bleed into the build. This breaks when users provide JSX in their
   * config.
   *
   * https://github.com/tinacms/tinacms/issues/3091
   */
  const tempTsConfigPath = path.join(tempDir, 'temp-tsconfig.json')
  await fs.outputFileSync(tempTsConfigPath, '{}')

  const outputPath = path.join(tempDir, outputFile)
  await build({
    bundle: true,
    platform: 'neutral',
    target: ['node10.4'],
    entryPoints: [prebuiltInputPath],
    treeShaking: true,
    external: [...external, './node_modules/*'],
    tsconfig: tempTsConfigPath,
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
