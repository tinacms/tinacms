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
import * as _ from 'lodash'
import type { TinaCloudSchema } from '@tinacms/graphql'
import { dangerText, logText } from '../../utils/theme'
import { defaultSchema } from './defaultSchema'
import { logger } from '../../logger'
import { getSchemaPath } from '../../lib'

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
  await fs.outputFile(path.join(tinaGeneratedPath, '.gitignore'), 'db')
}

export const compile = async (_ctx, _next) => {
  logger.info(logText('Compiling...'))
  let schemaExists = true
  try {
    getSchemaPath({ projectDir: tinaPath })
  } catch (_) {
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
  await transpile(tinaPath, tinaTempPath)

  // Delete the node require cache for .tina temp folder
  Object.keys(require.cache).map((key) => {
    if (key.startsWith(tinaTempPath)) {
      delete require.cache[require.resolve(key)]
    }
  })

  const schemaFunc = require(path.join(tinaTempPath, 'schema.js'))
  const schemaObject: TinaCloudSchema = schemaFunc.default
  await fs.outputFile(
    path.join(tinaConfigPath, 'schema.json'),
    JSON.stringify(schemaObject, null, 2)
  )
  await fs.remove(tinaTempPath)
}

const transpile = async (projectDir, tempDir) => {
  logger.info(logText('Transpiling...'))

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
    platform: 'node',
    target: ['node10.4'],
    entryPoints: [inputFile],
    external: [...external, './node_modules/*'],
    treeShaking: true,
    loader: {
      ".svg": "text",

    }
    outfile: outputPath,
  })
}

export const defineSchema = (config: TinaCloudSchema) => {
  return config
}
