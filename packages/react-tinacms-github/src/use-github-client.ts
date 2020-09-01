import { useCMS } from 'tinacms'
import { GithubClient } from './github-client'

export function useGithubClient(): GithubClient {
  const cms = useCMS()

  return cms.api.github
}
