import prompts from 'prompts';
import { linkText, logText } from '../../../utils/theme';

import type { Config, PromptGitProvider } from './types';

const supportedGitProviders: {
  github: PromptGitProvider;
  other: PromptGitProvider;
} = {
  github: {
    imports: [
      {
        from: 'tinacms-gitprovider-github',
        imported: ['GitHubProvider'],
        packageName: 'tinacms-gitprovider-github',
      },
    ],
    gitProviderClassText: `new GitHubProvider({
          branch,
          owner: process.env.GITHUB_OWNER,
          repo: process.env.GITHUB_REPO,
          token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
        })`,
  },
  other: {
    gitProviderClassText: '',
  },
};

export const chooseGitProvider = async ({ config }: { config: Config }) => {
  // const answers = await prompts([
  //   {
  //     name: 'provider',
  //     type: 'select',
  //     choices: [
  //       {
  //         title: 'GitHub',
  //         value: 'github',
  //       },
  //       {
  //         title: 'Other', // TODO should this be an input for init? it just leaves a broken database.ts file
  //         value: 'other',
  //       },
  //     ],
  //     message: 'Which Git provider are you using?',
  //   },
  // ])
  // if (typeof answers.provider === 'undefined') {
  //   throw new Error('Git provider is required')
  // }
  // if (answers.provider === 'other') {
  //   return supportedGitProviders.other
  // }
  const result = await prompts([
    {
      name: 'githubToken',
      type: 'text',
      message: `What is your GitHub Personal Access Token? (Hit enter to skip and set up later)\n${logText(
        'Learn more here: '
      )}${linkText(
        'https://tina.io/docs/r/self-hosting-nextjs/#github-personal-access-token'
      )}`,
      initial: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
    },
    {
      name: 'githubOwner',
      type: 'text',
      message: `What is your GitHub Owner (Your Github Username)? \n(Hit enter to skip and set up later)\n`,
    },
    {
      name: 'githubRepo',
      type: 'text',
      message: `What is your GitHub Repo name? Ex: my-nextjs-app \n(Hit enter to skip and set up later)\n`,
    },
  ]);
  // Add the env vars to the config
  config.envVars.push(
    {
      key: 'GITHUB_PERSONAL_ACCESS_TOKEN',
      value: result.githubToken,
    },
    {
      key: 'GITHUB_OWNER',
      value: result.githubOwner,
    },
    {
      key: 'GITHUB_REPO',
      value: result.githubRepo,
    }
  );
  return supportedGitProviders.github;
};
