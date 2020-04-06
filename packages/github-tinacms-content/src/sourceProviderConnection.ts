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
