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

import { execSync } from 'child_process'

function _getProjectIdByGit() {
  try {
    const originBuffer = execSync(
      `git config --local --get remote.origin.url`,
      {
        timeout: 1000,
        stdio: `pipe`,
      }
    )

    return String(originBuffer).trim()
  } catch (_) {
    return null
  }
}

export function getID(): string {
  return _getProjectIdByGit() || process.env.REPOSITORY_URL || process.cwd()
}
