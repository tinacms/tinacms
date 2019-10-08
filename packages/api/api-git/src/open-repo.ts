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

const GIT_SSH_COMMAND =
  'ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no'

/**
 * Opens and prepares a SimpleGit repository.
 *
 * @param absolutePath string
 */
export function openRepo(absolutePath: string) {
  const repo = git(absolutePath)

  /**
   * This is here to allow committing from the cloud
   *
   * `repo.env` overwrites the environment. Adding `...process.env`
   *  is required for accessing global config values. (i.e. user.name, user.email)
   */
  repo.env({ ...process.env, GIT_SSH_COMMAND: GIT_SSH_COMMAND })

  return repo
}
