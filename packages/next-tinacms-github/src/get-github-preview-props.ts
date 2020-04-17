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
import { GithubError } from './github/content/GithubError'
import { parseMarkdown } from './parse-markdown'
import { parseJson } from './parse-json'
import { SourceProviderConnection } from 'github/content'
import getDecodedData from './github/content/getDecodedData'

export interface PreviewData {
  github_access_token: string
  fork_full_name: string
  head_branch: string
  fileRelativePath: string
  format?: 'markdown' | 'json'
}

export interface GithubFile {
  sha: string
  fileRelativePath: string
  data: any
}

export interface GithubPreviewProps {
  props: {
    preview: boolean
    sourceProvider: SourceProviderConnection
    file: GithubFile | null
    error: GithubError | null
  }
}

export async function getGithubPreviewProps(
  options: PreviewData
): Promise<GithubPreviewProps> {
  const accessToken = options.github_access_token
  const sourceProvider = {
    forkFullName: options.fork_full_name || '',
    headBranch: options.head_branch || 'master',
  }
  let error: GithubError | null = null
  let file = null

  try {
    const response = await getDecodedData(
      sourceProvider.forkFullName,
      sourceProvider.headBranch || 'master',
      options.fileRelativePath,
      accessToken
    )

    const parse = options.format === 'markdown' ? parseMarkdown : parseJson

    file = {
      sha: response.sha,
      fileRelativePath: options.fileRelativePath,
      data: parse(response.content),
    }
  } catch (e) {
    if (e instanceof GithubError) {
      console.error(
        githubErrorMessage({
          path: options.fileRelativePath,
          sourceProvider,
          accessToken,
        })
      )
      console.error(e)
      error = { ...e } //workaround since we cant return error as JSON
    } else {
      throw e
    }
  }

  return {
    props: {
      file,
      sourceProvider,
      preview: true,
      error,
    },
  }
}

interface GithubErrorMessageInfo {
  path: string
  accessToken?: string
  sourceProvider: SourceProviderConnection
}
const githubErrorMessage = ({
  path,
  accessToken,
  sourceProvider,
}: GithubErrorMessageInfo) => `next-tinacms-github: Failed to fetch file from GitHub
- file: \t${path}
- repo: \t${sourceProvider.forkFullName}
- branch: \t${sourceProvider.headBranch}
- accessToken: \t${accessToken ? '******' : 'undefined'}
`
