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

import { parseURL, TINA_HOST } from './parseUrl'
const MOCK_HOST_PROD = `https://${TINA_HOST}`
const MOCK_HOST_LOCAL = `https://localhost:4001`
const MOCK_CLIENT_ID = '1234'
const MOCK_BRANCH = 'main'

describe('parseUrl', () => {
  it('returns the branch, client, ID and isLocalClient from a valid production URL', () => {
    const correctURL = `${MOCK_HOST_PROD}/content/${MOCK_CLIENT_ID}/github/${MOCK_BRANCH}`
    const { branch, clientId, isLocalClient } = parseURL(correctURL)
    expect(branch).toBe(MOCK_BRANCH)
    expect(clientId).toBe(MOCK_CLIENT_ID)
    expect(isLocalClient).toBe(false)
  })
  it('returns the branch, client, ID and isLocalClient from a valid local URL', () => {
    const correctURL = `${MOCK_HOST_LOCAL}/graphql`
    const { branch, clientId, isLocalClient } = parseURL(correctURL)
    expect(branch).toBe(null)
    expect(clientId).toBe(null)
    expect(isLocalClient).toBe(true)
  })
  it('handles when branch name contains a "/"', () => {
    const MOCK_BRANCH = 'foo/bar'
    const correctURL = `${MOCK_HOST_PROD}/content/${MOCK_CLIENT_ID}/github/${MOCK_BRANCH}`
    const { branch, clientId, isLocalClient } = parseURL(correctURL)
    expect(branch).toBe(MOCK_BRANCH)
    expect(clientId).toBe(MOCK_CLIENT_ID)
    expect(isLocalClient).toBe(false)
  })
  it('throws an error when an invalided format is provided', () => {
    const wrongURL = `${MOCK_HOST_PROD}/WRONG/${MOCK_CLIENT_ID}/github/${MOCK_BRANCH}`
    expect(() => {
      parseURL(wrongURL)
    }).toThrow()
  })
})
