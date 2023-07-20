import { InitEnvironment } from './environment'
import prompts, { PromptType } from 'prompts'
import { linkText, logText } from '../../utils/theme'

export interface Framework {
  name: 'next' | 'hugo' | 'jekyll' | 'other'
  reactive: boolean
}

async function promptForInitConfiguration(
  env: InitEnvironment,
  opts: { showSelfHosted?: boolean }
) {
  const promptOptions = { onCancel: () => process.exit(0) } // allow ctrl + c to exit

  // helpers
  const isNext = (promptType: PromptType) => (_, answers) =>
    answers.framework.name === 'next' ? promptType : null
  const isNextAuth = (promptType: PromptType) => (_, answers) =>
    answers.nextAuth ? promptType : null
  const dataLayerEnabled = (promptType: PromptType) => (_, answers) =>
    answers.dataLayer ? promptType : null
  const kvRestApiUrlEnabled = (promptType: PromptType) => (_, answers) =>
    answers.kvRestApiUrl ? promptType : null
  const selfHostedEnabled = (promptType: PromptType) => (_) =>
    opts.showSelfHosted ? promptType : null

  const forestryDisclaimer = logText(
    `Note: This migration will update some of your content to match tina.  Please save a backup of your content before doing this migration. (This can be done with git)`
  )

  let config: Record<any, any> = await prompts(
    [
      {
        name: 'packageManager',
        type: 'select',
        message: 'Choose your package manager',
        choices: [
          { title: 'PNPM', value: 'pnpm' },
          { title: 'Yarn', value: 'yarn' },
          { title: 'NPM', value: 'npm' },
        ],
      },
      {
        name: 'framework',
        type: 'select',
        message: 'What framework are you using?',
        choices: [
          { title: 'Next.js', value: { name: 'next', reactive: true } },
          { title: 'Hugo', value: { name: 'hugo', reactive: false } },
          { title: 'Jekyll', value: { name: 'jekyll', reactive: false } },
          {
            title: 'Other (SSG frameworks like gatsby, etc.)',
            value: { name: 'other', reactive: false },
          },
        ] as { title: string; value: Framework }[],
      },
      {
        name: 'typescript',
        type: 'confirm',
        initial: true,
        message:
          'Would you like to use Typescript for your Tina Configuration (Recommended)?',
      },
      {
        name: 'publicFolder',
        type: (_, answers) =>
          answers.framework.name !== 'next' && answers.framework.name !== 'hugo'
            ? 'text'
            : null,
        initial: 'public',
        message:
          `Where are public assets stored? (default: "public")\n` +
          logText(
            `Not sure what value to use? Refer to our "Frameworks" doc: ${linkText(
              'https://tina.io/docs/integration/frameworks/#configuring-tina-with-each-framework'
            )}`
          ),
      },
      {
        name: 'forestryMigrate',
        type: (_) => (env.forestryConfigExists ? 'confirm' : null),
        initial: true,
        message: `Would you like to migrate your Forestry templates?\n${forestryDisclaimer}`,
      },
      {
        name: 'frontMatterFormat',
        type: (_, answers) => {
          if (answers.framework.name === 'hugo' && answers.forestryMigrate) {
            if (env.frontMatterFormat && env.frontMatterFormat[1]) {
              return null
            }
            return 'select'
          }
        },
        choices: [
          { title: 'yaml', value: 'yaml' },
          { title: 'toml', value: 'toml' },
          { title: 'json', value: 'json' },
        ],
        message: `What format are you using in your frontmatter?`,
      },
      {
        name: 'overwriteTemplatesJS',
        type: (_, answers) =>
          !answers.typescript
            ? env.javascriptTemplatesExists
              ? 'confirm'
              : null
            : null,
        message: `Found existing file at ${env.javascriptTemplatesPath}. Would you like to override?`,
      },
      {
        name: 'overwriteTemplatesTS',
        type: (_, answers) =>
          answers.typescript
            ? env.typescriptTemplatesExists
              ? 'confirm'
              : null
            : null,
        message: `Found existing file at ${env.typescriptTemplatesPath}. Would you like to override?`,
      },
      {
        name: 'dataLayer',
        type: selfHostedEnabled('confirm'),
        initial: true,
        message: 'Enable Self-Hosted Data Layer?',
      },
      {
        name: 'clientId',
        type: (_, answers) => (answers.dataLayer ? 'text' : null),
        message: `What is your Tina Cloud Client ID? (Hit enter to skip and set up yourself later)\n${logText(
          "Don't have a Client ID? Create one here: "
        )}${linkText('https://app.tina.io/projects/new')}`,
      },
      {
        name: 'token',
        type: (_, answers) => (answers.dataLayer ? 'text' : null),
        message: (prev) =>
          `What is your Tina Cloud Read Only Token?\n${logText(
            "Don't have a Read Only Token? Create one here: "
          )}${linkText(
            `https://app.tina.io/projects/${prev || '[XXX]'}/tokens`
          )}`,
      },
      {
        name: 'dataLayerAdapter',
        message: 'Select a self-hosted data layer adapter',
        type: dataLayerEnabled('select'),
        choices: (_, answers) => {
          if (answers.framework.name === 'next') {
            return [
              { title: 'Vercel KV', value: 'upstash-redis' },
              { title: 'Upstash Redis', value: 'upstash-redis' },
            ]
          } else {
            return [{ title: 'Upstash Redis', value: 'upstash-redis' }]
          }
        },
      },
      {
        name: 'nextAuth',
        type:
          selfHostedEnabled('confirm') && isNext('confirm') ? 'confirm' : null,
        initial: 'true',
        message: 'Enable NextAuth.js integration?',
      },
      {
        name: 'nextAuthProvider',
        message: 'Select a self-hosted data layer adapter',
        type: isNextAuth('select'),
        choices: [
          {
            title: 'Vercel KV Credentials Provider',
            value: 'vercel-kv-credentials-provider',
          },
        ],
      },
      {
        name: 'nextAuthCredentialsProviderName',
        type: (_, answers) =>
          answers.nextAuthProvider === 'vercel-kv-credentials-provider'
            ? 'text'
            : null,
        message: `Enter a name for the Vercel KV Credentials Provider (Defaults to "VercelKVCredentialsProvider")`,
        initial: 'VercelKVCredentialsProvider',
      },
      {
        name: 'overwriteConfigJS',
        type: (_, answers) =>
          !answers.typescript
            ? env.javascriptConfigExists
              ? 'confirm'
              : null
            : null,
        message: `Found existing file at ${env.javascriptConfigExists}. Would you like to override?`,
      },
      {
        name: 'overwriteConfigTS',
        type: (_, answers) =>
          answers.typescript
            ? env.typescriptConfigExists
              ? 'confirm'
              : null
            : null,
        message: `Found existing file at ${env.typescriptConfigExists}. Would you like to override?`,
      },
      {
        name: 'overwriteSampleContent',
        type: (_, answers) => (env.sampleContentExists ? 'confirm' : null),
        message: `Found existing file at ${env.sampleContentPath}. Would you like to override?`,
      },
    ],
    promptOptions
  )

  if (config.dataLayerAdapter === 'upstash-redis') {
    config = {
      ...config,
      ...(await prompts([
        {
          name: 'kvRestApiUrl',
          type: 'text',
          message: `What is the KV (Redis) Rest API URL? (Hit enter to skip and set up yourself later)`,
        },
        {
          name: 'kvRestApiToken',
          type: kvRestApiUrlEnabled('text'),
          message: `What is the KV (Redis) Rest API Token? (Hit enter to skip and set up yourself later)`,
        },
      ])),
    }
  }

  if (config.nextAuth) {
    config = {
      ...config,
      ...(await prompts([
        {
          name: 'nextAuthSecret',
          type: 'text',
          message: `What is the NextAuth.js Secret? (Hit enter to use a randomly generated secret)`,
        },
      ])),
    }
  }

  if (config.nextAuthProvider === 'vercel-kv-credentials-provider') {
    config = {
      ...config,
      ...(await prompts([
        {
          name: 'kvRestApiUrl',
          type: kvRestApiUrlEnabled('text'),
          message: `What is the Vercel KV Rest API URL? (Hit enter to skip and set up yourself later)\n${logText(
            "Don't have a Vercel KV Store? Create one here: "
          )}${linkText('https://vercel.com/dashboard/stores')}`,
        },
        {
          name: 'kvRestApiToken',
          type: kvRestApiUrlEnabled('text'),
          message: `What is the Vercel KV Rest API Token? (Hit enter to skip and set up yourself later)`,
        },
        {
          name: 'vercelKVNextAuthCredentialsKey',
          type: 'text',
          message: `Enter a name for the Vercel KV Credentials Provider Auth Collection`,
        },
      ])),
    }
  }

  if (config.framework.name === 'next') {
    config.publicFolder = 'public'
  } else if (config.framework.name === 'hugo') {
    config.publicFolder = 'static'
  }

  return config
}

export default promptForInitConfiguration
