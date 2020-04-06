import { SourceProviderConnection } from './sourceProviderConnection'
import matter from 'gray-matter'
import getDecodedData from './getDecodedData'

export const getMarkdownFile = async (
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

  const { content: markdownBody, data: frontmatter } = matter(response.content)

  return {
    sha: response.sha,
    fileRelativePath: filePath,
    data: { frontmatter, markdownBody },
  }
}
