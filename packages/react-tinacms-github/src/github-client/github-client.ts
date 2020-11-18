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

import Cookies from 'js-cookie'
import { authenticate } from './authenticate'
import { EventsToAlerts } from '@tinacms/alerts'
export * from './authenticate'
import { CHECKOUT_BRANCH, COMMIT, CREATE_BRANCH, ERROR } from '../events'
import { b64EncodeUnicode } from './base64'
import { EventBus } from '@tinacms/core'

export interface GithubClientOptions {
  proxy: string
  clientId: string
  authCallbackRoute: string
  baseRepoFullName: string
  baseBranch?: string
  authScope?: AuthScope
  defaultCommitMessage?: string
}

export interface Branch {
  name: string
  protected: boolean
}

export type AuthScope = 'public_repo' | 'repo'

function removeLeadingSlash(path: string) {
  if (path.charAt(0) === '/') {
    return path.substring(1)
  }
  return path
}

export class GithubClient {
  static WORKING_REPO_COOKIE_KEY = 'working_repo_full_name'
  static HEAD_BRANCH_COOKIE_KEY = 'head_branch'

  events = new EventBus()

  alerts: EventsToAlerts = {
    [COMMIT]: () => ({
      level: 'success',
      message: `Saved Successfully: Changes committed to ${this.workingRepoFullName}`,
    }),
    [CHECKOUT_BRANCH]: event => ({
      level: 'info',
      message: 'Switched to branch ' + event.branchName,
    }),
    [ERROR]: event => ({
      level: 'error',
      message: event.message,
    }),
  }

  proxy: string
  baseRepoFullName: string
  baseBranch: string
  clientId: string
  authCallbackRoute: string
  authScope: AuthScope
  defaultCommitMessage: string

  constructor({
    proxy,
    clientId,
    authCallbackRoute,
    baseRepoFullName,
    baseBranch = 'master',
    authScope = 'public_repo',
    defaultCommitMessage = 'Update from TinaCMS',
  }: GithubClientOptions) {
    this.proxy = proxy
    this.baseRepoFullName = baseRepoFullName
    this.baseBranch = baseBranch
    this.clientId = clientId
    this.authCallbackRoute = authCallbackRoute
    this.authScope = authScope
    this.defaultCommitMessage = defaultCommitMessage
    this.validate()
  }

  authenticate() {
    return authenticate(this.clientId, this.authCallbackRoute, this.authScope)
  }

  isAuthenticated() {
    return this.getUser()
  }

  get isFork() {
    return this.workingRepoFullName !== this.baseRepoFullName
  }

  async isAuthorized(): Promise<boolean> {
    try {
      const repo = await this.getRepository()

      return repo.permissions.push
    } catch {
      return false
    }
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

  getRepository() {
    return this.req({
      url: `https://api.github.com/repos/${this.workingRepoFullName}`,
    })
  }

  async createFork() {
    const fork = await this.req({
      url: `https://api.github.com/repos/${this.baseRepoFullName}/forks`,
      method: 'POST',
    })

    this.setCookie(GithubClient.WORKING_REPO_COOKIE_KEY, fork.full_name)

    return fork
  }

  createPR(title: string, body: string) {
    const workingRepoFullName = this.workingRepoFullName
    const headBranch = this.branchName

    return this.req({
      url: `https://api.github.com/repos/${this.baseRepoFullName}/pulls`,
      method: 'POST',
      data: {
        title: title ? title : this.defaultCommitMessage,
        body: body ? body : 'Please pull these awesome changes in!',
        head: `${workingRepoFullName.split('/')[0]}:${headBranch}`,
        base: this.baseBranch,
      },
    })
  }

  get workingRepoFullName(): string {
    const forkName = this.getCookie(GithubClient.WORKING_REPO_COOKIE_KEY)

    if (forkName) {
      return forkName
    }

    return this.baseRepoFullName
  }

  checkout(branch: string, repo?: string) {
    if (repo) this.setWorkingRepoFullName(repo)
    this.setWorkingBranch(branch)
  }

  /**
   * @deprecated Call GithubClient#checkout instead
   */
  setWorkingRepoFullName(repoFullName: string) {
    this.setCookie(GithubClient.WORKING_REPO_COOKIE_KEY, repoFullName)
  }

  get branchName(): string {
    const branchName = this.getCookie(GithubClient.HEAD_BRANCH_COOKIE_KEY)

    if (branchName) {
      return branchName
    }

    return this.baseBranch
  }

  /**
   * @deprecated Call GithubClient#checkout instead
   */
  setWorkingBranch(branch: string) {
    if (this.branchName === branch) return

    this.setCookie(GithubClient.HEAD_BRANCH_COOKIE_KEY, branch)
    this.events.dispatch({
      type: CHECKOUT_BRANCH,
      branchName: branch,
    })
    this.events.dispatch({
      type: 'unstable:reload-form-data',
    })
  }

  async fetchExistingPR() {
    const workingRepoFullName = this.workingRepoFullName
    const headBranch = this.branchName

    const branches = await this.req({
      url: `https://api.github.com/repos/${this.baseRepoFullName}/pulls`,
      method: 'GET',
    })

    for (let i = 0; i < branches.length; i++) {
      const pull = branches[i]
      if (headBranch === pull.head.ref) {
        if (
          pull.head.repo?.full_name === workingRepoFullName &&
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
      const workingRepoFullName = this.workingRepoFullName
      const branch = this.branchName

      const data = await this.req({
        url: `https://api.github.com/repos/${workingRepoFullName}/git/ref/heads/${branch}`,
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

  async getBranchList(): Promise<Branch[]> {
    return await this.req({
      url: `https://api.github.com/repos/${this.workingRepoFullName}/branches`,
      method: 'GET',
    })
  }

  async createBranch(name: string) {
    const currentBranch = await this.getBranch()
    const sha = currentBranch.object.sha
    const response = await this.req({
      url: `https://api.github.com/repos/${this.workingRepoFullName}/git/refs`,
      method: 'POST',
      data: {
        ref: `refs/heads/${name}`,
        sha,
      },
    })

    this.events.dispatch({
      type: CREATE_BRANCH,
      branchName: name,
    })

    return response
  }

  async commit(
    filePath: string,
    sha: string,
    fileContents: string,
    commitMessage: string = this.defaultCommitMessage
  ) {
    const repo = this.workingRepoFullName
    const branch = this.branchName
    const response = await this.req({
      url: `https://api.github.com/repos/${repo}/contents/${removeLeadingSlash(
        filePath
      )}`,
      method: 'PUT',
      data: {
        message: commitMessage,
        content: b64EncodeUnicode(fileContents),
        sha,
        branch: branch,
      },
    })
    this.events.dispatch({ type: COMMIT, response })
    return response
  }

  async getDownloadUrl(path: string): Promise<string> {
    const res = await this.fetchFile(path, false)
    return res.download_url
  }

  async fetchFile(filePath: string, decoded: boolean = true) {
    const repo = this.workingRepoFullName
    const branch = this.branchName
    const request = await this.req({
      url: `https://api.github.com/repos/${repo}/contents/${removeLeadingSlash(
        filePath
      )}?ref=${branch}`,
      method: 'GET',
    })

    // decode using base64 decoding (https://developer.mozilla.org/en-US/docs/Glossary/Base64)
    request.content = decoded ? atob(request.content || '') : request.content
    return request
  }

  /*
  added or deletes files from github
  */
  async githubFileApi(
    path: string,
    fileContents: string,
    commitMessage: string = this.defaultCommitMessage,
    encoded: boolean = false,
    method: 'PUT' | 'DELETE'
  ) {
    const repo = this.workingRepoFullName
    const branch = this.branchName

    let sha = null
    try {
      ;({ sha } = await this.fetchFile(path))
    } catch (e) {}

    return this.req({
      url: `https://api.github.com/repos/${repo}/contents/${removeLeadingSlash(
        path
      )}`,
      method,
      data: {
        message: commitMessage,
        content: encoded ? fileContents : b64EncodeUnicode(fileContents),
        branch: branch,
        sha: sha || '',
      },
    })
  }

  async upload(
    path: string,
    fileContents: string,
    commitMessage: string = this.defaultCommitMessage,
    encoded: boolean = false
  ) {
    return this.githubFileApi(path, fileContents, commitMessage, encoded, 'PUT')
  }

  async delete(
    path: string,
    commitMessage: string = `Deleted ${path} using TinaCMS`
  ) {
    try {
      return await this.githubFileApi(path, '', commitMessage, false, 'DELETE')
    } catch (e) {
      this.events.dispatch({
        type: ERROR,
        message: `Failed to delete: ${e.message}`,
      })
    }
  }

  protected async req(data: any) {
    const response = await this.proxyRequest(data)
    return this.getGithubResponse(response)
  }

  protected async getGithubResponse(response: Response) {
    const data = await response.json()
    //2xx status codes
    if (response.status.toString()[0] == '2') return data

    throw new GithubError(data.message || response.statusText, response.status)
  }

  private validate(): void {
    const errors = []
    if (!this.proxy) {
      errors.push('Missing `proxy` URL')
    }
    if (!this.authCallbackRoute) {
      errors.push('Missing `authCallbackRoute`')
    }
    if (!this.baseRepoFullName) {
      errors.push(
        'Missing `baseRepoFullName`. It may not have been set in environment variables.'
      )
    }
    if (!this.clientId) {
      errors.push(
        'Missing `clientId`. It may not have been set in environment variables.'
      )
    }
    if (errors.length) {
      throw new Error(createErrorMessage(errors))
    }
  }

  /**
   * The methods below maybe don't belong on GitHub client, but it's fine for now.
   */
  private proxyRequest(data: any) {
    // For implementations using the csrf mitigation
    const token = localStorage.getItem('tinacms-github-token') || null

    const headers = new Headers()

    if (token) {
      headers.append('Authorization', 'Bearer ' + token)
    } else {
      console.warn(
        'Deprecation Notice: You are using an old authentication flow, please migrate to the new one (see https://tinacms.org/blog/upgrade-notice-improved-github-security)'
      )
    }

    return fetch(this.proxy, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    })
  }

  private getCookie(cookieName: string): string | undefined {
    return Cookies.get(cookieName)
  }

  private setCookie(cookieName: string, val: string) {
    Cookies.set(cookieName, val, { sameSite: 'strict' })
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

const createErrorMessage = (
  errors: string[]
) => `Failed to create the TinaCMS GithubClient

${errors.map(error => `\t* ${error}`).join('\n')}

Visit the setup guide for more information

\thttps://tinacms.org/guides/nextjs/github-open-authoring/configure-custom-app
`
