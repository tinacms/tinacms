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
import * as fs from 'fs'
import { deleteFile, writeFile } from './file-writer'
import { checkFilePathIsInParent } from './utils'

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
    return path.join(this.contentAbsolutePath, '/tmp')
  }

  get sshKeyPath() {
    return path.join(this.pathToRepo, this.SSH_KEY_RELATIVE_PATH)
  }

  fileAbsolutePath(fileRelativePath: string) {
    return path.join(this.contentAbsolutePath, fileRelativePath)
  }

  fileRelativePath(filepath: string) {
    return path.posix.join(this.pathToContent, filepath)
  }

  fileIsInRepo(filepath: string) {
    return checkFilePathIsInParent(filepath, this.contentAbsolutePath)
  }

  writeFile(filepath: string, contents: string | Buffer) {
    const fileAbsolutePath = this.fileAbsolutePath(filepath)
    if (this.fileIsInRepo(fileAbsolutePath)) {
      writeFile(fileAbsolutePath, contents)
    } else {
      throw new Error(
        `Failed to write to: ${filepath} \nCannot write outside of the content directory.`
      )
    }
  }

  async deleteFiles(filepath: string, commitOptions: CommitOptions) {
    const fileAbsolutePath = this.fileAbsolutePath(filepath)
    if (this.fileIsInRepo(fileAbsolutePath)) {
      deleteFile(fileAbsolutePath)
      await this.commit(commitOptions)
    } else {
      throw new Error(
        `Failed to delete: ${filepath} \nCannot delete outside of the content directory.`
      )
    }
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
  async getFileAtHead(filepath: string) {
    try {
      const relativePath = this.fileRelativePath(filepath)
      return await this.open().show([
        `HEAD:${relativePath.replace(/^\/*/, '')}`,
      ])
    } catch (e) {
      return fs.readFileSync(this.fileAbsolutePath(filepath), {
        encoding: 'utf8',
      })
    }
  }

  async getOrigin() {
    const remotes = await this.open().getRemotes(true)
    const originRemotes = remotes.filter(r => r.name == 'origin')

    if (!originRemotes.length) {
      console.warn('No origin remote on the given repo')
      return
    }

    return originRemotes[0].refs.push
  }

  async updateOrigin(newRemote: string) {
    const repo = this.open()

    const existingRemotes = await repo.getRemotes(true)
    if (existingRemotes.filter(r => r.name == 'origin').length) {
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
      fs.statSync(this.sshKeyPath)
      options = [
        ...options,
        '-o IdentitiesOnly=yes',
        `-i ${this.sshKeyPath}`,
        '-F /dev/null',
      ]
    } catch {
      /**
       * Throws if SSH does not exist.
       * Not that there's anything wrong with that.
       */
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
