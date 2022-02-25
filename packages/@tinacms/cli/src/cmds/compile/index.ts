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

import path from 'path'
import fs from 'fs-extra'
import { build } from 'esbuild'
import type { Loader } from 'esbuild'
import * as _ from 'lodash'
import type { TinaCloudSchema } from '@tinacms/graphql'
import { dangerText, logText } from '../../utils/theme'
import { defaultSchema } from './defaultSchema'
import { logger } from '../../logger'
import { getSchemaPath } from '../../lib'
import chalk from 'chalk'
import { ExecuteSchemaError, BuildSchemaError } from '../start-server/errors'

const tinaPath = path.join(process.cwd(), '.tina')
const packageJSONFilePath = path.join(process.cwd(), 'package.json')
const tinaGeneratedPath = path.join(tinaPath, '__generated__')
const tinaTempPath = path.join(tinaGeneratedPath, 'temp')
const tinaConfigPath = path.join(tinaGeneratedPath, 'config')

export const resetGeneratedFolder = async () => {
  try {
    await fs.rmdir(tinaGeneratedPath, {
      recursive: true,
    })
  } catch (e) {
    console.log(e)
  }
  await fs.mkdir(tinaGeneratedPath)
  await fs.outputFile(path.join(tinaGeneratedPath, '.gitignore'), 'db*')
}

// Cleanup function that is guaranteed to run
const cleanup = async ({ tinaTempPath }: { tinaTempPath: string }) => {
  await fs.remove(tinaTempPath)
}

export const compile = async (_ctx, _next) => {
  logger.info(logText('Compiling...'))
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
      .tina/schema.ts not found, Creating one for you...
      See Documentation: https://tina.io/docs/tina-cloud/cli/#getting-started"
      `)
    )
    // We will default to TS?
    const file = path.join(tinaPath, 'schema.ts')
    // Ensure there is a .tina/schema.ts file
    await fs.ensureFile(file)
    // Write a basic schema to it
    await fs.writeFile(file, defaultSchema)
  }

  // Turns the schema into JS files so they can be run
  try {
    await transpile(tinaPath, tinaTempPath)
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
    await fs.outputFile(
      path.join(tinaConfigPath, 'schema.json'),
      JSON.stringify(schemaObject, null, 2)
    )
    await cleanup({ tinaTempPath })
  } catch (e) {
    // Always remove the temp code
    await cleanup({ tinaTempPath })
    // Throw an execution error
    throw new ExecuteSchemaError(e)
  }
}

const transpile = async (projectDir, tempDir) => {
  logger.info(logText('Building javascript...'))

  const packageJSON = JSON.parse(
    fs.readFileSync(packageJSONFilePath).toString() || '{}'
  )
  const deps = packageJSON?.dependencies || []
  const peerDeps = packageJSON?.peerDependencies || []
  const devDeps = packageJSON?.devDependencies || []
  const external = Object.keys({ ...deps, ...peerDeps, ...devDeps })
  const inputFile = getSchemaPath({ projectDir })

  const outputPath = path.join(tempDir, 'schema.js')
  await build({
    bundle: true,
    platform: 'neutral',
    target: ['node10.4'],
    entryPoints: [inputFile],
    treeShaking: true,
    external: [...external, './node_modules/*'],
    loader: loaders,
    outfile: outputPath,
  })
  logger.info(logText(`Javascript built`))
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
