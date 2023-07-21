import { Octokit } from '@octokit/rest'
import { Base64 } from 'js-base64'
import type { GitProvider } from '@tinacms/graphql'

export interface GitHubProviderOptions {
  owner: string
  repo: string
  token: string
  branch: string
}

export class GitHubProvider implements GitProvider {
  octokit: Octokit
  owner: string
  repo: string
  branch: string

  constructor(args: GitHubProviderOptions) {
    this.owner = args.owner
    this.repo = args.repo
    this.branch = args.branch
    this.octokit = new Octokit({
      auth: args.token,
    })
  }

  async onPut(key: string, value: string) {
    let sha
    try {
      const {
        // @ts-ignore
        data: { sha: existingSha },
      } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: key,
        ref: this.branch,
      })
      sha = existingSha
    } catch (e) {}

    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path: key,
      message: 'commit from self-hosted tina',
      content: Base64.encode(value),
      branch: this.branch,
      sha,
    })
  }

  async onDelete(key: string) {
    let sha
    try {
      const {
        // @ts-ignore
        data: { sha: existingSha },
      } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: key,
        ref: this.branch,
      })
      sha = existingSha
    } catch (e) {}

    if (sha) {
      await this.octokit.repos.deleteFile({
        owner: this.owner,
        repo: this.repo,
        path: key,
        message: 'commit from self-hosted tina',
        branch: this.branch,
        sha,
      })
    } else {
      throw new Error(
        `Could not find file ${key} in repo ${this.owner}/${this.repo}`
      )
    }
  }
}
