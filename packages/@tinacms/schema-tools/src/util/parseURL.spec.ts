/**

*/

import { parseURL, TINA_HOST } from './parseURL'
const MOCK_HOST_PROD = `https://${TINA_HOST}`
const MOCK_HOST_LOCAL = `https://localhost:4001`
const MOCK_CLIENT_ID = '1234'
const MOCK_VERSION = 'beta'
const MOCK_BRANCH = 'main'

describe('parseUrl', () => {
  it('returns the branch, client, ID and isLocalClient from a valid production URL', () => {
    const correctURL = `${MOCK_HOST_PROD}/${MOCK_VERSION}/content/${MOCK_CLIENT_ID}/github/${MOCK_BRANCH}`
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
    const correctURL = `${MOCK_HOST_PROD}/${MOCK_VERSION}/content/${MOCK_CLIENT_ID}/github/${MOCK_BRANCH}`
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
