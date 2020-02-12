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
import { promises as fs } from 'fs'
import { commit, CommitOptions } from './commit'

export interface GitRepoConfig {
  pathToRepo: string
  pathToContent: string
  gitRemote?: string
  sshKey?: string
}

export class Repo {

  pathToRepo: string
  pathToContent: string
  gitRemote?: string
  sshKey?: string

  SSH_KEY_RELATIVE_PATH = '.ssh/id_rsa'

  constructor(options: GitRepoConfig) {
    this.pathToRepo = options.pathToRepo
    this.pathToContent = options.pathToContent
    this.gitRemote = options.gitRemote
    this.sshKey = options.sshKey
  }

  get contentAbsolutePath() {
    return path.join(this.pathToRepo, this.pathToContent)
  }

  get tmpDir() {
    return path.join(this.contentAbsolutePath, '/tmp/')
  }

  fileAbsolutePath(fileRelativePath: string) {
    return path.join(this.contentAbsolutePath, fileRelativePath)
  }

  commit(options: Omit<CommitOptions, "pathRoot">) {
    return commit({
      pathRoot: this.pathToRepo,
      ...options
    })
  }

  push() {
    return this.open().push()
  }

  reset(files: string[]) {
    return this.open().checkout(files[0])
  }

  getFileAtHead(fileRelativePath: string) {
    try {
      return this.open().show([`HEAD:${fileRelativePath}`])
    } catch (e) {
      return fs.readFile(path.join(this.pathToRepo, fileRelativePath), { encoding: 'utf8' })
    }
  }

  open() {
    const repo = git(this.pathToRepo)

    let options = [
      '-o UserKnownHostsFile=/dev/null',
      '-o StrictHostKeyChecking=no',
    ]

    if (this.sshKey) {
      options = [
        ...options,
        '-o IdentitiesOnly=yes',
        `-i ${path.join(this.pathToRepo, this.SSH_KEY_RELATIVE_PATH)}`,
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
}