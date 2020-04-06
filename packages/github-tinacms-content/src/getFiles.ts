import { getContent } from './getContent'
import { SourceProviderConnection } from './sourceProviderConnection'
import { GithubError } from './GithubError'

export const getFiles = async (
  filePath: string,
  sourceProviderConnection: SourceProviderConnection,
  accessToken: string
) => {
  let data

  try {
    ;({ data } = await getContent(
      sourceProviderConnection.forkFullName,
      sourceProviderConnection.headBranch || 'master',
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
