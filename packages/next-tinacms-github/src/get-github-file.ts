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

import getDecodedData from './github/content/getDecodedData'

export interface GithubFile<Data> {
  sha: string
  fileRelativePath: string
  data: Data
}

export interface GetGithubFileOptions<Data> {
  repoFullName: string
  branch: string
  fileRelativePath: string
  accessToken: string
  parse(content: string): Data
}

export async function getGithubFile<Data = any>({
  repoFullName,
  branch,
  fileRelativePath,
  accessToken,
  parse,
}: GetGithubFileOptions<Data>): Promise<GithubFile<Data>> {
  const response = await getDecodedData(
    repoFullName,
    branch,
    fileRelativePath,
    accessToken
  )

  return {
    sha: response.sha,
    fileRelativePath,
    data: parse(response.content),
  }
}
