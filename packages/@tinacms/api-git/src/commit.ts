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

import { openRepo } from './open-repo'

export interface CommitOptions {
  pathRoot: string
  files: string[]
  message: string
  name?: string
  email?: string
  push?: boolean
}

/**
 * Commit a set of files in a Git repo
 */
export async function commit({
  files,
  message,
  name,
  email,
  pathRoot,
  push,
}: CommitOptions) {
  let options
  if (email) {
    options = {
      '--author': `"${name || email} <${email}>"`,
    }
  }

  const repo = openRepo(pathRoot)

  const branchName = await repo.revparse('--abbrev-ref HEAD')
  console.log(`branchName ${branchName}`)

  await repo.add(files)
  const commitResult = await repo.commit(message, files, options)
  return push ? await repo.push('origin', branchName) : commitResult
}
