import prompts from 'prompts';
import type { PromptObject } from 'prompts';

import { linkText, logText } from '../../../utils/theme';
import { Config } from './types';

const tinaCloudSetupQuestions: PromptObject[] = [
  {
    name: 'clientId',
    type: 'text',
    message: `What is your TinaCloud Client ID? (Hit enter to skip and set up yourself later)\n${logText(
      "Don't have a Client ID? Create one here: "
    )}${linkText('https://app.tina.io/projects/new')}`,
    initial: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  },
  {
    name: 'token',
    type: 'text',
    message: (prev) =>
      `What is your TinaCloud Read Only Token?\n${logText(
        "Don't have a Read Only Token? Create one here: "
      )}${linkText(`https://app.tina.io/projects/${prev || '[XXX]'}/tokens`)}`,
    initial: process.env.TINA_TOKEN,
  },
];

export const askTinaCloudSetup = async ({ config }: { config: Config }) => {
  const { clientId, token } = await prompts(tinaCloudSetupQuestions);
  config.envVars.push(
    {
      key: 'NEXT_PUBLIC_TINA_CLIENT_ID',
      value: clientId,
    },
    {
      key: 'TINA_TOKEN',
      value: token,
    }
  );
};
