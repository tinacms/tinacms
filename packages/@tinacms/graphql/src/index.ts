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

export { GithubBridge } from './primitives/database/github'
export type { GithubManagerInit } from './primitives/database/github'
export {
  gql,
  resolve,
  buildSchema,
  indexDB,
  createDatabase,
  githubRoute,
} from './primitives'

import type {
  TinaCloudSchema as TinaCloudSchemaBase,
  TinaCloudCollection as TinaCloudCollectionBase,
  TinaCloudTemplateBase as TinaTemplate,
  TinaFieldBase,
} from './primitives/types'

import { Octokit } from '@octokit/rest'

export const listBranches = async ({ auth, owner, repo }) => {
  const appOctoKit = new Octokit({ auth })
  const branchList = await appOctoKit.repos.listBranches({
    owner,
    repo,
    per_page: 100,
  })

  return branchList
}

export const createBranch = async ({ auth, owner, repo, name, baseBranch }) => {
  const appOctoKit = new Octokit({ auth })
  const currentBranch = await appOctoKit.repos.getBranch({
    owner,
    repo,
    branch: baseBranch,
  })

  const newBranch = await appOctoKit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${name}`,
    sha: currentBranch.data.commit.sha,
  })

  return newBranch
}

export type TinaCloudSchema = TinaCloudSchemaBase<false>
// Alias to remove Cloud
export type TinaSchema = TinaCloudSchema
export type TinaCloudCollection = TinaCloudCollectionBase<false>
// Alias to remove Cloud
export type TinaCollection = TinaCloudCollectionBase<false>
export type TinaField = TinaFieldBase
export type { TinaTemplate }
