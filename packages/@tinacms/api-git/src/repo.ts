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

import git from 'simple-git/promise'

import * as path from 'path'
import { promises as fs } from 'fs'
import { deleteFile } from './file-writer'

export interface CommitOptions {
  files: string[]
  message: string
  name?: string
  email?: string
}

export class Repo {
  SSH_KEY_RELATIVE_PATH = '.ssh/id_rsa'

  constructor(
    public pathToRepo: string = process.cwd(),
    public pathToContent: string = ''
  ) {}

  get contentAbsolutePath() {
    return path.join(this.pathToRepo, this.pathToContent)
  }

  get tmpDir() {
    return path.join(this.contentAbsolutePath, '/tmp/')
  }

  get sshKeyPath() {
    return path.join(this.pathToRepo, this.SSH_KEY_RELATIVE_PATH)
  }

  fileAbsolutePath(fileRelativePath: string) {
    return path.posix.join(this.contentAbsolutePath, fileRelativePath)
  }

  fileRelativePath(filepath: string) {
    return path.posix.join(this.pathToContent, filepath)
  }

  async deleteFiles(filepath: string, deleteOptions: CommitOptions) {
    const fileAbsolutePath = this.fileAbsolutePath(filepath)

    // TODO: we need to check if it is safe to delete the file. See the put route for an example
    deleteFile(fileAbsolutePath)
    await this.commit(deleteOptions)
  }

  /**
   *
   * @param options
   */
  async commit(options: CommitOptions) {
    const { files: relFilePaths, message, name, email } = options
    const files = relFilePaths.map(rel => this.fileAbsolutePath(rel))
    let flags
    if (options.email) {
      flags = {
        '--author': `"${name || email} <${email}>"`,
      }
    }

    const repo = this.open()

    await repo.add(files)
    return await repo.commit(message, files, flags)
  }

  async push() {
    const repo = this.open()
    const branchName = await repo.revparse(['--abbrev-ref', 'HEAD'])
    // @ts-ignore The types are incorrect for push
    return repo.push(['-u', 'origin', branchName])
  }

  reset(filepath: string) {
    const absPath = this.fileAbsolutePath(filepath)
    return this.open().checkout(absPath)
  }

  /**
   *
   * @param filepath
   * @todo This method name is not ideal. We want the latest version of the file that has been committed or the current version of a file that has not been committed
   *
   */
  getFileAtHead(filepath: string) {
    try {
      const relativePath = this.fileRelativePath(filepath)
      return this.open().show([`HEAD:${relativePath.replace(/^\/*/, '')}`])
    } catch (e) {
      return fs.readFile(this.fileAbsolutePath(filepath), {
        encoding: 'utf8',
      })
    }
  }

  async getOrigin() {
    const remotes = await this.open().getRemotes(true)
    const originRemotes = remotes.filter((r: any) => r.name == 'origin')

    if (!originRemotes.length) {
      console.warn('No origin remote on the given repo')
      return
    }

    return originRemotes[0].refs.push
  }

  async updateOrigin(newRemote: string) {
    const repo = this.open()

    const existingRemotes = await repo.getRemotes(true)
    if (existingRemotes.filter((r: any) => r.name == 'origin').length) {
      console.warn(`Changing remote origin to ${newRemote}`)
    }

    await repo.removeRemote('origin')
    await repo.addRemote('origin', newRemote)
  }

  open() {
    const repo = git(this.pathToRepo)

    let options = [
      '-o UserKnownHostsFile=/dev/null',
      '-o StrictHostKeyChecking=no',
    ]

    try {
      fs.stat(this.sshKeyPath)
      options = [
        ...options,
        '-o IdentitiesOnly=yes',
        `-i ${this.sshKeyPath}`,
        '-F /dev/null',
      ]
    } catch {
      console.warn('No SSH key set.')
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
