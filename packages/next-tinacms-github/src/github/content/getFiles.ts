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

import { getContent } from './getContent'
import { GithubError } from './GithubError'

export const getFiles = async (
  filePath: string,
  repoFullName: string,
  branch: string,
  accessToken: string
) => {
  let data

  try {
    ;({ data } = await getContent(
      repoFullName,
      branch || 'master',
      filePath,
      accessToken
    ))
  } catch (e) {
    const errorStatus = e.response?.status || 500
    throw new GithubError('Failed to get data.', errorStatus)
  }

  return data
    .filter((file: any) => file.type === 'file')
    .map((file: any) => file.path)
}
