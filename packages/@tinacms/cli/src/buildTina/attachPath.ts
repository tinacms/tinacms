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

export const attachPath = async <C extends object>(args: {
  context: C
  options: { rootPath?: string }
}): Promise<C & { rootPath: string; usingTs: boolean }> => {
  const rootPath = args.options.rootPath || process.cwd()
  return {
    ...args.context,
    rootPath,
    usingTs: await isProjectTs(rootPath),
  }
}

export const isProjectTs = async (rootPath: string) => {
  const tinaPath = path.join(rootPath, '.tina')

  return (
    (await pathExists(path.join(tinaPath, 'schema.ts'))) ||
    (await pathExists(path.join(tinaPath, 'schema.tsx'))) ||
    (await pathExists(path.join(tinaPath, 'config.ts'))) ||
    (await pathExists(path.join(tinaPath, 'config.tsx')))
  )
}
