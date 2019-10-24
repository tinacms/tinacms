/**

Copyright 2019 Forestry.io Inc

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

import * as fs from 'fs'
import * as path from 'path'
import { openRepo } from './open-repo'

export interface ShowConfig {
  pathRoot: string
  fileRelativePath: string
}

export async function show({ pathRoot, fileRelativePath }: ShowConfig) {
  let repo = openRepo(pathRoot)

  try {
    return await repo.show([`HEAD:${fileRelativePath}`])
  } catch (e) {
    return fs.readFileSync(path.join(pathRoot, fileRelativePath), 'utf8')
  }
}
