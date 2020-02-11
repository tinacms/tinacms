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
import { commit, CommitOptions } from './commit'
import { openRepo } from './open-repo'
import { show } from '../build/show'

export interface GitRepoConfig {
  pathToRepo: string
  pathToContent: string
}

export class Repo {

  pathToRepo: string
  pathToContent: string

  constructor(options: GitRepoConfig) {
    this.pathToRepo = options.pathToRepo
    this.pathToContent = options.pathToContent
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
    return openRepo(this.pathToRepo).push()
  }

  reset(files: string[]) {
    return openRepo(this.pathToRepo).checkout(files[0])
  }

  getFileAtHead(fileRelativePath: string) {
    return show({
      pathRoot: this.pathToRepo,
      fileRelativePath
    })
  }
}