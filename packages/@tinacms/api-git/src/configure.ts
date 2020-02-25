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
import * as fs from 'fs'
import { isSSHUrl, getGitSSHUrl } from './utils'
import { Repo } from './repo'
import atob from 'atob'

// Ensure remote URL is ssh
export async function updateRemoteToSSH(repo: Repo) {
  const remote = await repo.getOrigin()

  if (remote && !isSSHUrl(remote)) {
    const newRemote = getGitSSHUrl(remote)
    await repo.updateOrigin(newRemote)
  }
}

function createSSHKey(repo: Repo, sshKey: string) {
  const parentDir = path.dirname(repo.sshKeyPath)
  fs.mkdirSync(parentDir, { recursive: true })
  fs.writeFileSync(repo.sshKeyPath, atob(sshKey), {
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
    createSSHKey(repo, sshKey)
  } else {
    console.warn(
      'No SSH key set. You may be unable to make commits using TinaCMS. ' +
        'The TinaCMS git server requires an SSH key to work in cloud ' +
        'editing environments. Please visit the documentation to learn ' +
        'more: https://tinacms.org/docs/gatsby/configure-git-plugin'
    )
  }
  if (gitRemote) {
    await repo.updateOrigin(gitRemote)
  } else {
    await updateRemoteToSSH(repo)
  }
}
