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

import { isSSHUrl } from './utils'
import { Repo } from './repo'

export interface GitRemoteConfig {
  pathToRepo?: string
  gitRemote?: string
  sshKey?: string
}

// Ensure remote URL is ssh
export async function updateRemoteToSSH(repo: Repo) {
  const originURL = await repo.getOrigin()

  if (originURL && !isSSHUrl(originURL)) {
    await repo.updateOrigin(originURL)
  }
}

export async function configureGitRemote(
  repo: Repo,
  gitRemote?: string,
  sshKey?: string
) {
  if (sshKey) {
    await repo.createSSHKey(sshKey)
  }
  if (gitRemote) {
    await repo.updateOrigin(gitRemote)
  } else {
    await updateRemoteToSSH(repo)
  }
}
