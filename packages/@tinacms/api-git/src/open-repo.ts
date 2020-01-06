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

const git = require('simple-git/promise')
import * as path from 'path'

export const SSH_KEY_RELATIVE_PATH = '.ssh/id_rsa'

/**
 * Opens and prepares a SimpleGit repository.
 *
 * @param absolutePath string
 */
export function openRepo(absolutePath: string) {
  const repo = git(absolutePath)

  let options = [
    '-o UserKnownHostsFile=/dev/null',
    '-o StrictHostKeyChecking=no',
  ]

  if (process.env.SSH_KEY) {
    options = [
      ...options,
      '-o IdentitiesOnly=yes',
      `-i ${path.join(absolutePath, SSH_KEY_RELATIVE_PATH)}`,
      '-F /dev/null',
    ]
  }

  /**
   * This is here to allow committing from the cloud
   *
   * `repo.env` overwrites the environment. Adding `...process.env`
   *  is required for accessing global config values. (i.e. user.name, user.email)
   */

  repo.env({
    GIT_COMMITTER_EMAIL: 'tina@tinacms.org',
    GIT_COMMITTER_NAME: 'TinaCMS',
    ...process.env,
    GIT_SSH_COMMAND: `ssh ${options.join(' ')}`,
  })

  return repo
}
