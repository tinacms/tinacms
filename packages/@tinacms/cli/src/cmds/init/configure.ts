import { Framework, GeneratedFile, InitEnvironment } from '.'
import prompts, { PromptType } from 'prompts'
import { linkText, logText } from '../../utils/theme'
import crypto from 'crypto-js'
import { logger } from '../../logger'

async function configure(
  env: InitEnvironment,
  opts: { debug?: boolean; isBackend?: boolean }
) {
  const promptOptions = { onCancel: () => process.exit(0) } // allow ctrl + c to exit

  // helpers
  const isNext = (promptType: PromptType) => (_, answers) =>
    answers.framework.name === 'next' ? promptType : null
  const isNextAuth = (promptType: PromptType) => (_, answers) =>
    answers.nextAuth ? promptType : null

  // conditionally generate overwrite prompts for generated ts/js
  const generatedFileOverwritePrompt = ({
    condition,
    configName,
    generatedFile,
  }: {
    configName: string
    condition: (answers: any) => boolean
    generatedFile: GeneratedFile
  }) => {
    const results = []
    if (generatedFile.javascriptExists) {
      results.push({
        name: `overwrite${configName}JS`,
        type: (_, answers) =>
          !answers.typescript && condition(answers) ? 'confirm' : null,
        message: `Found existing file at ${generatedFile.fullPathJS}. Would you like to overwrite?`,
      })
    }
    if (generatedFile.typescriptExists) {
      results.push({
        name: `overwrite${configName}TS`,
        type: (_, answers) =>
          answers.typescript && condition(answers) ? 'confirm' : null,
        message: `Found existing file at ${generatedFile.fullPathTS}. Would you like to overwrite?`,
      })
    }
    return results
  }

  const forestryDisclaimer = logText(
    `Note: This migration will update some of your content to match tina.  Please save a backup of your content before doing this migration. (This can be done with git)`
  )
  if (opts.isBackend && !env.tinaConfigExists) {
    logger.info('Looks like Tina has not been setup, setting up now...')
  }

  // This is always run durring tinacms init
  const tinaSetupPrompts: prompts.PromptObject[] = [
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
          ? env.generatedFiles['templates'].javascriptExists
            ? 'confirm'
            : null
          : null,
      message: `Found existing file at ${env.generatedFiles['templates'].javascriptExists}. Would you like to overwrite?`,
    },
    {
      name: 'overwriteTemplatesTS',
      type: (_, answers) =>
        answers.typescript
          ? env.generatedFiles['templates'].typescriptExists
            ? 'confirm'
            : null
          : null,
      message: `Found existing file at ${env.generatedFiles['templates'].fullPathTS}. Would you like to overwrite?`,
    },
  ]
  // These questions are adding when running `tinacms init backend`
  const backendSetupCommands: prompts.PromptObject[] = [
    {
      name: 'hosting',
      type: 'select',
      choices: [
        {
          title: 'Tina Cloud',
          value: 'tina-cloud',
        },
        {
          title: 'Self Host',
          value: 'self-host',
        },
      ],
      message:
        'Do you want to use Tina Cloud to host your backend or self-host? (In self hosting you will have to bring your own auth, database and backend)',
    },
    {
      name: 'githubToken',
      type: (_, answers) => {
        return answers.hosting === 'self-host' ? 'text' : null
      },
      message: `What is your GitHub Personal Access Token? (Hit enter to skip and set up later)\n${logText(
        'Learn more here: '
      )}${linkText(
        'https://tina.io/docs/self-hosted/existing-site/#github-personal-access-token'
      )}`,
      initial: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
    },
    {
      name: 'dataLayerAdapter',
      message: 'Select a self-hosted Database Adapter',
      type: (_, answers) => {
        if (answers.hosting === 'self-host') {
          return 'select'
        }
      },
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
      name: 'kvRestApiUrl',
      type: (_, answers) =>
        answers.dataLayerAdapter === 'upstash-redis' ? 'text' : null,
      message: `What is the KV (Redis) Rest API URL? (Hit enter to skip and set up yourself later)`,
      initial: process.env.KV_REST_API_URL,
    },
    {
      name: 'kvRestApiToken',
      type: (prev, answers) =>
        prev !== undefined && answers.hosting === 'self-host' ? 'text' : null,
      message: `What is the KV (Redis) Rest API Token? (Hit enter to skip and set up yourself later)`,
      initial: process.env.KV_REST_API_TOKEN,
    },
    {
      name: 'nextAuth',
      type: (_, answers) => {
        return answers.hosting === 'self-host' && isNext('confirm')
          ? 'confirm'
          : null
      },
      initial: 'true',
      message: 'Enable NextAuth.js integration?',
    },
    {
      name: 'nextAuthSecret',
      type: (_, answers) => (answers.nextAuth ? 'text' : null),
      message: `What is the NextAuth.js Secret? (Hit enter to use a randomly generated secret)`,
      initial:
        process.env.NEXTAUTH_SECRET ||
        crypto.lib.WordArray.random(16).toString(),
    },
    {
      name: 'clientId',
      type: (_, answers) => {
        return answers.hosting === 'self-host' ? null : 'text'
      },
      message: `What is your Tina Cloud Client ID? (Hit enter to skip and set up yourself later)\n${logText(
        "Don't have a Client ID? Create one here: "
      )}${linkText('https://app.tina.io/projects/new')}`,
      initial: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
    },
    {
      name: 'token',
      type: (_, answers) => {
        return answers.hosting === 'self-host' ? null : 'text'
      },
      message: (prev) =>
        `What is your Tina Cloud Read Only Token?\n${logText(
          "Don't have a Read Only Token? Create one here: "
        )}${linkText(
          `https://app.tina.io/projects/${prev || '[XXX]'}/tokens`
        )}`,
      initial: process.env.TINA_TOKEN,
    },
    {
      name: 'nextAuthProvider',
      message: 'Select a NextAuth Credentials Provider',
      type: isNextAuth('select'),
      choices: [
        {
          title: 'Vercel KV Credentials Provider',
          value: 'vercel-kv-credentials-provider',
        },
      ],
    },
    {
      name: 'kvRestApiUrl',
      type: (_, answers) =>
        answers.nextAuthProvider === 'vercel-kv-credentials-provider' &&
        answers.kvRestApiUrl === undefined
          ? 'text'
          : null,
      message: `What is the KV (Redis) Rest API URL? (Hit enter to skip and set up yourself later)`,
      initial: process.env.KV_REST_API_URL,
    },
    {
      name: 'kvRestApiToken',
      type: (_, answers) =>
        answers.nextAuthProvider === 'vercel-kv-credentials-provider' &&
        answers.kvRestApiUrl !== undefined &&
        answers.kvRestApiToken === undefined
          ? 'text'
          : null,
      message: `What is the KV (Redis) Rest API Token? (Hit enter to skip and set up yourself later)`,
      initial: process.env.KV_REST_API_TOKEN,
    },
  ]

  if (env.tinaConfigExists && !opts.isBackend) {
    logger.info(
      `Tina config already exists, skipping setup. (If you want to init tina from sratch, delete your tina config file and run this command again)`
    )
    process.exit(0)
  }

  const skipTinaSetupCommands = env.tinaConfigExists

  let config: Record<any, any> = await prompts(
    [
      // Always ask for the framework
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
        name: 'packageManager',
        type: 'select',
        message: 'Choose your package manager',
        choices: [
          { title: 'PNPM', value: 'pnpm' },
          { title: 'Yarn', value: 'yarn' },
          { title: 'NPM', value: 'npm' },
        ],
      },

      // only setup TinaCMS if they don't have a tina config
      ...(skipTinaSetupCommands ? [] : tinaSetupPrompts),
      // Only add the backend init questions if they are running the backend init command
      ...(opts.isBackend ? backendSetupCommands : []),
      // tina/config.ts
      ...generatedFileOverwritePrompt({
        condition: (_) => !env.tinaConfigExists,
        configName: 'Config',
        generatedFile: env.generatedFiles['config'],
      }),
      // tina/database.ts
      ...generatedFileOverwritePrompt({
        condition: (answers) => !!(answers.hosting === 'self-host'),
        configName: 'Database',
        generatedFile: env.generatedFiles['database'],
      }),
      // tina/auth.ts
      ...generatedFileOverwritePrompt({
        condition: (answers) => !!answers.nextAuthProvider,
        configName: 'Auth',
        generatedFile: env.generatedFiles['auth'],
      }),
      // pages/api/gql.ts
      ...generatedFileOverwritePrompt({
        condition: (answers) => !!(answers.hosting === 'self-host'),
        configName: 'GqlApiHandler',
        generatedFile: env.generatedFiles['gql-api-handler'],
      }),
      // pages/api/auth/[...nextauth].ts
      ...generatedFileOverwritePrompt({
        condition: (answers) => !!answers.nextAuthProvider,
        configName: 'NextAuthApiHandler',
        generatedFile: env.generatedFiles['next-auth-api-handler'],
      }),
      // pages/auth/signin.tsx
      ...generatedFileOverwritePrompt({
        condition: (answers) =>
          answers.nextAuthProvider === 'vercel-kv-credentials-provider',
        configName: 'VercelKVCredentialsProviderSignin',
        generatedFile:
          env.generatedFiles['vercel-kv-credentials-provider-signin'],
      }),
      // pages/auth/register.tsx
      ...generatedFileOverwritePrompt({
        condition: (answers) =>
          answers.nextAuthProvider === 'vercel-kv-credentials-provider',
        configName: 'VercelKVCredentialsProviderRegister',
        generatedFile:
          env.generatedFiles['vercel-kv-credentials-provider-register'],
      }),
      // pages/auth/tw.module.css
      ...generatedFileOverwritePrompt({
        condition: (answers) =>
          answers.nextAuthProvider === 'vercel-kv-credentials-provider',
        configName: 'VercelKVCredentialsProviderTailwindCSS',
        generatedFile:
          env.generatedFiles['vercel-kv-credentials-provider-tailwindcss'],
      }),
      // pages/api/credentials/register.ts
      ...generatedFileOverwritePrompt({
        condition: (answers) =>
          answers.nextAuthProvider === 'vercel-kv-credentials-provider',
        configName: 'VercelKVCredentialsProviderRegisterApiHandler',
        generatedFile:
          env.generatedFiles[
            'vercel-kv-credentials-provider-register-api-handler'
          ],
      }),
      // pages/demo/blog/[filename].tsx
      ...generatedFileOverwritePrompt({
        condition: (answers) => answers.framework.reactive,
        configName: 'ReactiveExample',
        generatedFile: env.generatedFiles['reactive-example'],
      }),
      {
        name: 'overwriteSampleContent',
        type: (_) =>
          env.sampleContentExists && !env.tinaConfigExists ? 'confirm' : null,
        message: `Found existing file at ${env.sampleContentPath}. Would you like to overwrite?`,
      },
    ],
    promptOptions
  )

  if (env.tinaConfigExists) {
    // We didn't ask if they wanted to use Typescript, but we can infer
    // from their existing config file
    config.typescript = env.generatedFiles.config.typescriptExists
  }

  // If we are doing a backend init we can set the vercelKVNextAuthCredentialsKey default
  if (opts.isBackend) {
    config.vercelKVNextAuthCredentialsKey =
      process.env.NEXTAUTH_CREDENTIALS_KEY || 'tinacms_users'
  }

  config.nextAuthCredentialsProviderName = 'VercelKVCredentialsProvider'
  config.isLocalEnvVarName = 'TINA_PUBLIC_IS_LOCAL'

  if (config.framework.name === 'next') {
    config.publicFolder = 'public'
  } else if (config.framework.name === 'hugo') {
    config.publicFolder = 'static'
  }

  if (opts.debug) {
    console.log('Configuration:')
    console.log(JSON.stringify(config, null, 2))
  }

  return config
}

export default configure
