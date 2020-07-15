import getDecodedData from './github/content/getDecodedData'

export interface GithubFile<Data> {
  sha: string
  fileRelativePath: string
  data: Data
}

export interface GetGithubFileOptions<Data> {
  repoFullName: string
  branch: string
  fileRelativePath: string
  accessToken: string
  parse(content: string): Data
}

export async function getGithubFile<Data = any>({
  repoFullName,
  branch,
  fileRelativePath,
  accessToken,
  parse,
}: GetGithubFileOptions<Data>): Promise<GithubFile<Data>> {
  const response = await getDecodedData(
    repoFullName,
    branch,
    fileRelativePath,
    accessToken
  )

  return {
    sha: response.sha,
    fileRelativePath,
    data: parse(response.content),
  }
}
