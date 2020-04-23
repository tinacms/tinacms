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
const atob = require('atob')

const b64DecodeUnicode = (str: string) => {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(function(c: string) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )
}

// TODO - this name kinda sucks,
// Throw a formatted error on 404, and decode github data properly
const getDecodedData = async (
  workingRepoFullName: string,
  headBranch: string,
  path: string,
  accessToken: string
) => {
  let data = null

  try {
    ;({ data } = await getContent(
      workingRepoFullName,
      headBranch,
      path,
      accessToken
    ))
  } catch (e) {
    const errorStatus = e.response?.status || 500
    throw new GithubError('Failed to get data.', errorStatus)
  }

  return { ...data, content: b64DecodeUnicode(data.content) }
}

export default getDecodedData
