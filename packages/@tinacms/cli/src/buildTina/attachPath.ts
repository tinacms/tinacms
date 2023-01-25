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

import { pathExists } from 'fs-extra'
import path from 'path'
import fs from 'fs-extra'
import prompts from 'prompts'
import { logger } from '../logger'
import { focusText } from '../utils/theme'

export const attachPath = async <C extends object>(args: {
  context: C
  options: { rootPath?: string; moveConfig?: boolean }
}): Promise<
  C & { rootPath: string; tinaDirectory: string; usingTs: boolean }
> => {
  const rootPath = args.options.rootPath || process.cwd()
  if (args.options.moveConfig) {
    await prompts({
      name: 'move',
      type: 'confirm',
      initial: true,
      message: `Preparing to move Tina config, ensure you've committed your
  latest changes to source control before continuing. Proceed?`,
    })
    const oldTinaConfigPath = path.join(rootPath, '.tina')
    const newTinaConfigPath = path.join(rootPath, 'tina')
    if (fs.existsSync(newTinaConfigPath)) {
      console.log(
        'New tina config already exists, ignoring --moveConfig option'
      )
    } else {
      if (!fs.existsSync(oldTinaConfigPath)) {
        throw new Error(`Unable to find .tina folder, exiting`)
      }
      logger.info(
        `Copying config files from ${focusText('.tina')} to ${focusText(
          'tina'
        )}`
      )
      await fs.copy(path.join(rootPath, '.tina'), path.join(rootPath, 'tina'))
      await fs.removeSync(path.join(rootPath, '.tina'))
    }
  }

  // const tinaDirectory = '.tina'
  let tinaDirectory = 'tina'
  if (fs.existsSync(path.join(rootPath, '.tina'))) {
    if (fs.existsSync(path.join(rootPath, 'tina'))) {
      console.log(
        'Detected "tina" and ".tina" folders, it\'s safe to remove the ".tina" folder'
      )
    } else {
      console.log('Detected legacy directory for tina, move to "tina"')
      tinaDirectory = '.tina'
    }
  }
  return {
    ...args.context,
    tinaDirectory,
    rootPath,
    usingTs: await isProjectTs(rootPath, tinaDirectory),
  }
}

export const isProjectTs = async (
  rootPath: string,
  tinaDirectory: string = '.tina'
) => {
  const tinaPath = path.join(rootPath, tinaDirectory)

  return (
    (await pathExists(path.join(tinaPath, 'schema.ts'))) ||
    (await pathExists(path.join(tinaPath, 'schema.tsx'))) ||
    (await pathExists(path.join(tinaPath, 'config.ts'))) ||
    (await pathExists(path.join(tinaPath, 'config.tsx')))
  )
}
