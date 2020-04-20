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

import { b64EncodeUnicode } from './base64'
import { getForkName, getHeadBranch } from '../github-editing-context'

export class GithubClient {
  proxy: string
  baseRepoFullName: string
  baseBranch: string
  constructor(
    proxy: string,
    baseRepoFullName: string,
    baseBranch: string = 'master'
  ) {
    this.proxy = proxy
    this.baseRepoFullName = baseRepoFullName
    this.baseBranch = baseBranch
  }

  async getUser() {
    try {
      const data = await this.req({
        url: `https://api.github.com/user`,
        method: 'GET',
      })

      return data
    } catch (e) {
      if ((e.status = 401)) {
        return
      }
      throw e
    }
  }

  createFork() {
    return this.req({
      url: `https://api.github.com/repos/${this.baseRepoFullName}/forks`,
      method: 'POST',
    })
  }

  createPR(title: string, body: string) {
    const forkRepoFullName = this.repoFullName
    const headBranch = this.branchName

    return this.req({
      url: `https://api.github.com/repos/${this.baseRepoFullName}/pulls`,
      method: 'POST',
      data: {
        title: title ? title : 'Update from TinaCMS',
        body: body ? body : 'Please pull these awesome changes in!',
        head: `${forkRepoFullName.split('/')[0]}:${headBranch}`,
        base: this.baseBranch,
      },
    })
  }

  get repoFullName(): string {
    return getForkName() || this.baseRepoFullName
  }

  get branchName() {
    return getHeadBranch()
  }

  async fetchExistingPR() {
    const forkRepoFullName = this.repoFullName
    const headBranch = this.branchName

    const branches = await this.req({
      url: `https://api.github.com/repos/${this.baseRepoFullName}/pulls`,
      method: 'GET',
    })

    for (let i = 0; i < branches.length; i++) {
      const pull = branches[i]
      if (headBranch === pull.head.ref) {
        if (
          pull.head.repo?.full_name === forkRepoFullName &&
          pull.base.repo?.full_name === this.baseRepoFullName
        ) {
          return pull // found matching PR
        }
      }
    }

    return
  }

  async getBranch() {
    try {
      const repoFullName = this.repoFullName
      const branch = this.branchName

      const data = await this.req({
        url: `https://api.github.com/repos/${repoFullName}/git/ref/heads/${branch}`,
        method: 'GET',
      })
      return data
    } catch (e) {
      if ((e.status = 404)) {
        return
      }
      throw e
    }

    // TODO
    // if (data.ref.startsWith('refs/heads/')) {
    //   //check if branch, and not tag
    //   return data
    // }
    // return // Bubble up error here?
  }

  async save(
    repo: string,
    branch: string,
    filePath: string,
    sha: string,
    formData: string,
    message: string = 'Update from TinaCMS'
  ) {
    return this.req({
      url: `https://api.github.com/repos/${repo}/contents/${filePath}`,
      method: 'PUT',
      data: {
        message,
        content: b64EncodeUnicode(formData),
        sha,
        branch: branch,
      },
    })
  }

  private async req(data: any) {
    const response = await this.proxyRequest(data)
    return this.getGithubResponse(response)
  }

  private async getGithubResponse(response: Response) {
    const data = await response.json()
    //2xx status codes
    if (response.status.toString()[0] == '2') return data

    throw new GithubError(response.statusText, response.status)
  }

  private proxyRequest(data: any) {
    return fetch(this.proxy, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

class GithubError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.message = message
    this.status = status
  }
}
