import prompts from 'prompts'
import { linkText, logText } from '../../../utils/theme'

import type { Config, PromptGitProvider } from './types'

const supportedGitProviders: {
  github: PromptGitProvider
  other: PromptGitProvider
} = {
  github: {
    imports: [
      { from: 'tinacms-gitprovider-github', imported: ['GitHubProvider'] },
    ],
    gitProviderClassText: `new GitHubProvider({
          branch: process.env.GITHUB_BRANCH,
          owner: process.env.GITHUB_OWNER,
          repo: process.env.GITHUB_REPO,
          token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
        })`,
  },
  other: {
    gitProviderClassText: '',
  },
}

export const chooseGitProvider = async ({ config }: { config: Config }) => {
  const answers = await prompts([
    {
      name: 'provider',
      type: 'select',
      choices: [
        {
          title: 'GitHub',
          value: 'github',
        },
        {
          title: 'I will make my own git provider',
          value: 'other',
        },
      ],
      message: 'Which Git provider are you using?',
    },
  ])
  if (typeof answers.provider === 'undefined') {
    throw new Error('Git provider is required')
  }
  if (answers.provider === 'other') {
    return supportedGitProviders.other
  }
  const result = await prompts({
    name: 'githubToken',
    type: 'text',
    message: `What is your GitHub Personal Access Token? (Hit enter to skip and set up later)\n${logText(
      'Learn more here: '
    )}${linkText(
      'https://tina.io/docs/self-hosted/existing-site/#github-personal-access-token'
    )}`,
    initial: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  })
  config.githubToken = result.githubToken
  return supportedGitProviders.github
}
