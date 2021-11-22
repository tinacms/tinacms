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

import glob from 'fast-glob'
import normalize from 'normalize-path'
import path from 'path'
import fs from 'fs-extra'
import * as ts from 'typescript'
import * as _ from 'lodash'
import type { TinaCloudSchema } from '@tinacms/graphql'
import { dangerText, logText } from '../../utils/theme'
import { defaultSchema } from './defaultSchema'
import { logger } from '../../logger'

const tinaPath = path.join(process.cwd(), '.tina')
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
  // FIXME: This assume it is a schema.ts file
  if (
    !fs.existsSync(tinaPath) ||
    !fs.existsSync(path.join(tinaPath, 'schema.ts'))
  ) {
    // The schema.ts file does not exist
    logger.info(
      dangerText(`
      .tina/schema.ts not found, Creating one for you...
      See Documentation: https://tina.io/docs/tina-cloud/cli/#getting-started"
      `)
    )
    const file = path.join(tinaPath, 'schema.ts')
    // Ensure there is a .tina/schema.ts file
    await fs.ensureFile(file)
    // Write a basic schema to it
    await fs.writeFile(file, defaultSchema)
  }

  // Remove old js files
  await resetGeneratedFolder

  // Turn the TS files into JS files so they can be exacted
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
  // Make sure that post paths are posix (unix paths). This is necessary on windows.
  const posixProjectDir = normalize(projectDir)
  const posixTempDir = normalize(tempDir)

  return Promise.all(
    glob
      // We will replaces \\ with / as required by docs see: https://github.com/mrmlnc/fast-glob#how-to-write-patterns-on-windows
      .sync(path.join(projectDir, '**', '*.ts').replace(/\\/g, '/'), {
        ignore: [
          path
            .join(projectDir, '__generated__', '**', '*.ts')
            .replace(/\\/g, '/'),
        ],
      })
      .map(async function (file) {
        const fullPath = path.resolve(file)

        const contents = await fs.readFileSync(fullPath).toString()
        const newContent = ts.transpile(contents)
        const newPath = file
          .replace(posixProjectDir, posixTempDir)
          .replace('.ts', '.js')
        await fs.outputFile(newPath, newContent)
        return true
      })
  )
}

export const defineSchema = (config: TinaCloudSchema) => {
  return config
}
