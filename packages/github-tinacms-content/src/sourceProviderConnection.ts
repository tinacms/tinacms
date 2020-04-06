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

export interface SourceProviderConnection {
  forkFullName: string
  headBranch: string
}

export interface Response {
  accessToken: string | null
  sourceProviderConnection: SourceProviderConnection | null
}

export interface PreviewData {
  fork_full_name: string
  head_branch: string
  github_access_token: string
}

export const getGithubDataFromPreviewProps = (
  previewData?: PreviewData
): Response => {
  if (!previewData) {
    return {
      sourceProviderConnection: null,
      accessToken: null,
    }
  }

  return {
    accessToken: previewData.github_access_token,
    sourceProviderConnection: {
      forkFullName: previewData.fork_full_name,
      headBranch: previewData.head_branch || 'master',
    },
  }
}
