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
import prompts from 'prompts'
import { logger } from '../logger'
import { focusText } from '../utils/theme'

export const moveTinaFolder = async <C extends object>(args: {
  context: C
  options: { rootPath?: string; moveConfig?: boolean }
}): Promise<C> => {
  const rootPath = args.options.rootPath || process.cwd()
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
    console.log('New tina config already exists, exiting.')
  } else {
    if (!fs.existsSync(oldTinaConfigPath)) {
      throw new Error(`Unable to find .tina folder, exiting`)
    }
    logger.info(
      `Copying config files from ${focusText('.tina')} to ${focusText('tina')}`
    )
    await fs.copy(path.join(rootPath, '.tina'), path.join(rootPath, 'tina'))
    await prompts({
      name: 'remove',
      type: 'confirm',
      initial: true,
      message:
        'Removing .tina folder, please ensure the new tina folder config is correct before proceeding. Proceed?',
    })
    await fs.removeSync(path.join(rootPath, '.tina'))
  }

  return args.context
}
