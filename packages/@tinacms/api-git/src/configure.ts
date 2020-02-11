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

import { openRepo, SSH_KEY_RELATIVE_PATH } from './open-repo'
import { getGitSSHUrl, isSSHUrl } from './utils/gitUrl'
import atob from 'atob'
import { GitRouterConfig } from './router'

// Ensure remote URL is ssh
export async function updateRemoteToSSH(pathRoot: string) {
  const repo = await openRepo(pathRoot)
  const remotes = await repo.getRemotes(true)
  const originRemotes = remotes.filter((r: any) => r.name == 'origin')

  if (!originRemotes.length) {
    console.warn('No origin remote on the given repo')
    return
  }

  const originURL = originRemotes[0].refs.push

  if (originURL && !isSSHUrl(originURL)) {
    await repo.removeRemote('origin')
    const newRemote = getGitSSHUrl(originURL)
    await repo.addRemote('origin', newRemote)
  }
}

export async function configureGitRemote({ pathToRepo, gitRemote, sshKey }: GitRouterConfig) {
  const PATH_ROOT = pathToRepo || process.cwd()
  if (sshKey) {
    await createSSHKey(PATH_ROOT, sshKey)
  }
  if (gitRemote) {
    await updateOrigin(PATH_ROOT, gitRemote)
  }
  await updateRemoteToSSH(PATH_ROOT)
}

async function updateOrigin(pathRoot: string, remote: string) {
  const repo = await openRepo(pathRoot)
  const newRemote = getGitSSHUrl(remote)

  const existingRemotes = await repo.getRemotes(true)
  if (existingRemotes.filter((r: any) => r.name == 'origin').length) {
    console.warn(`Changing remote origin to ${newRemote}`)
  }

  await repo.removeRemote('origin')
  await repo.addRemote('origin', newRemote)
}

async function createSSHKey(pathRoot: string, sshKey: string) {
  const ssh_path = path.join(pathRoot, SSH_KEY_RELATIVE_PATH)
  const parentDir = path.dirname(ssh_path)
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true })
  }
  fs.writeFileSync(ssh_path, atob(sshKey), {
    encoding: 'utf8',
    mode: 0o600,
  })
}