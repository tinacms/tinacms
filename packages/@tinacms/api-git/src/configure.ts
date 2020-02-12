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

import * as path from 'path'
import { promises as fs } from 'fs'
import { isSSHUrl } from './utils'
import { Repo } from './repo'

// Ensure remote URL is ssh
export async function updateRemoteToSSH(repo: Repo) {
  const originURL = await repo.getOrigin()

  if (originURL && !isSSHUrl(originURL)) {
    await repo.updateOrigin(originURL)
  }
}

async function createSSHKey(repo: Repo, sshKey: string) {
  const parentDir = path.dirname(repo.sshKeyPath)
  await fs.mkdir(parentDir, { recursive: true })
  await fs.writeFile(repo.sshKeyPath, atob(sshKey), {
    encoding: 'utf8',
    mode: 0o600,
  })
}

export async function configureGitRemote(
  repo: Repo,
  gitRemote?: string,
  sshKey?: string
) {
  if (sshKey) {
    await createSSHKey(repo, sshKey)
  }
  if (gitRemote) {
    await repo.updateOrigin(gitRemote)
  } else {
    await updateRemoteToSSH(repo)
  }
}
