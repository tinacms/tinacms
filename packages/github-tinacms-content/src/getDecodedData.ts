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
  repoFullName: string,
  headBranch: string,
  path: string,
  accessToken: string
) => {
  let data = null

  try {
    ;({ data } = await getContent(repoFullName, headBranch, path, accessToken))
  } catch (e) {
    const errorStatus = e.response?.status || 500
    throw new GithubError('Failed to get data.', errorStatus)
  }

  return { ...data, content: b64DecodeUnicode(data.content) }
}

export default getDecodedData
