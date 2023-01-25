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

export const attachPath = async <C extends object>(args: {
  context: C
  options: { rootPath?: string; moveConfig?: boolean }
}): Promise<
  C & { rootPath: string; tinaDirectory: string; usingTs: boolean }
> => {
  const rootPath = args.options.rootPath || process.cwd()

  // const tinaDirectory = '.tina'
  let tinaDirectory = 'tina'
  if (fs.existsSync(path.join(rootPath, '.tina'))) {
    if (fs.existsSync(path.join(rootPath, 'tina'))) {
      console.log(
        'Detected "tina" and ".tina" folders, it\'s safe to remove the ".tina" folder'
      )
    } else {
      console.log(
        'It is now recommended to use "tina" for the config folder. Move your contents with "tinacms move-tina-config"'
      )
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
