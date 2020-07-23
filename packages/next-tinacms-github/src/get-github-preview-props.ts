/**
 *

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
import { GithubFile, getGithubFile } from './get-github-file'

export interface PreviewData<Data> {
  github_access_token: string
  working_repo_full_name: string
  head_branch: string
  fileRelativePath: string
  parse(content: string): Data
}

export interface GithubPreviewProps<Data> {
  props: {
    preview: boolean
    repoFullName: string
    branch: string
    file: GithubFile<Data> | null
    error: GithubError | null
  }
}

export async function getGithubPreviewProps<Data = any>(
  options: PreviewData<Data>
): Promise<GithubPreviewProps<Data>> {
  const accessToken = options.github_access_token
  const repoFullName = options.working_repo_full_name || ''
  const branch = options.head_branch || 'master'

  let error: GithubError | null = null
  let file = null

  try {
    file = await getGithubFile(options)
  } catch (e) {
    if (e instanceof GithubError) {
      console.error(
        githubErrorMessage({
          path: options.fileRelativePath,
          repoFullName,
          branch,
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
      repoFullName,
      branch,
      preview: true,
      error,
    },
  }
}

interface GithubErrorMessageInfo {
  path: string
  accessToken?: string
  repoFullName: string
  branch: string
}
const githubErrorMessage = ({
  path,
  accessToken,
  repoFullName,
  branch,
}: GithubErrorMessageInfo) => `next-tinacms-github: Failed to fetch file from GitHub
- file: \t${path}
- repo: \t${repoFullName}
- branch: \t${branch}
- accessToken: \t${accessToken ? '******' : 'undefined'}
`
