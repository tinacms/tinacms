/**

Copyright 2021 Forestry.io Holdings, Inc.

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

import getDecodedData from './github/content/getDecodedData'

export interface GithubFile<Data> {
  sha: string
  fileRelativePath: string
  data: Data
}

export interface GetGithubFileOptions<Data> {
  fileRelativePath: string
  github_access_token: string
  working_repo_full_name: string
  head_branch: string
  parse(content: string): Data
}

export async function getGithubFile<Data = any>({
  working_repo_full_name,
  head_branch,
  fileRelativePath,
  github_access_token,
  parse,
}: GetGithubFileOptions<Data>): Promise<GithubFile<Data>> {
  const response = await getDecodedData(
    working_repo_full_name,
    head_branch,
    fileRelativePath,
    github_access_token
  )

  return {
    sha: response.sha,
    fileRelativePath,
    data: parse(response.content),
  }
}
