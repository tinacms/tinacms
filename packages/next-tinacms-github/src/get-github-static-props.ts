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
import { getMarkdownFile } from './github/content/getMarkdownFile'
import { getJsonFile } from './github/content/getJsonFile'
import { SourceProviderConnection } from 'github/content'

export interface PreviewMeta {
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

export interface GithubStaticProps {
  props: {
    preview: boolean
    sourceProvider: SourceProviderConnection
    file: GithubFile | null
    error: GithubError | null
  }
}

export async function getGithubStaticProps(
  preview: boolean,
  options: PreviewMeta
): Promise<GithubStaticProps> {
  const sourceProvider = {
    forkFullName: options.fork_full_name || '',
    headBranch: options.head_branch || 'master',
  }
  let error: GithubError | null = null
  let file = null

  try {
    const accessToken = options.github_access_token
    const getParsedFile =
      options.format === 'markdown' ? getMarkdownFile : getJsonFile

    file = await getParsedFile(
      options.fileRelativePath,
      sourceProvider,
      accessToken
    )
  } catch (e) {
    if (e instanceof GithubError) {
      error = { ...e } //workaround since we cant return error as JSON
    } else {
      throw e
    }
  }

  return {
    props: {
      file,
      sourceProvider,
      preview,
      error,
    },
  }
}
