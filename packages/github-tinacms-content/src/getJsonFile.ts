import { SourceProviderConnection } from './sourceProviderConnection'
import getDecodedData from './getDecodedData'

export const getJsonFile = async (
  filePath: string,
  sourceProviderConnection: SourceProviderConnection,
  accessToken: string
) => {
  const response = await getDecodedData(
    sourceProviderConnection.forkFullName,
    sourceProviderConnection.headBranch || 'master',
    filePath,
    accessToken
  )

  return {
    sha: response.sha,
    fileRelativePath: filePath,
    data: JSON.parse(response.content),
  }
}
