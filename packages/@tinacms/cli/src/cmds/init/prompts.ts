import prompts from 'prompts'
import crypto from 'crypto-js'
import type { PromptObject } from 'prompts'
import { linkText, logText } from '../../utils/theme'
import { Framework, InitEnvironment } from '.'

export type Config = {
  typescript: boolean
  publicFolder?: string
  framework: Framework
  packageManager: 'pnpm' | 'yarn' | 'npm'
  forestryMigrate: boolean
  frontMatterFormat?: 'yaml' | 'toml' | 'json'
  hosting?: 'tina-cloud' | 'self-host'
  clientId?: string
  token?: string
  githubToken?: string
  gitProvider?: PromptGitProvider
  databaseAdapter?: PromptDatabaseAdapter
  authenticationProvider?: PromptAuthenticationProvider
  kvRestApiUrl?: string
  kvRestApiToken?: string
  mongoDBUri?: string
  nextAuthSecret?: string
  vercelKVNextAuthCredentialsKey?: string
  nextAuthCredentialsProviderName?: string
  isLocalEnvVarName: string
}

const forestryDisclaimer = logText(
  `Note: This migration will update some of your content to match tina.  Please save a backup of your content before doing this migration. (This can be done with git)`
)

// Asks the user for the framework and package manager they are using
export const askCommonSetUp = async () => {
  const answers = await prompts([
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
  ])
  if (
    typeof answers.framework === 'undefined' ||
    typeof answers.packageManager === 'undefined'
  ) {
    throw new Error('Framework and package manager are required')
  }
  return answers as {
    framework: Framework
    packageManager: 'pnpm' | 'yarn' | 'npm'
  }
}
export const askForestryMigrate = async ({
  framework,
  env,
}: {
  framework: Framework
  env: InitEnvironment
}) => {
  const questions: PromptObject[] = [
    {
      name: 'forestryMigrate',
      type: 'confirm',
      initial: true,
      message: `Would you like to migrate your Forestry templates?\n${forestryDisclaimer}`,
    },
  ]
  if (framework.name === 'hugo') {
    questions.push({
      name: 'frontMatterFormat',
      type: (_, answers) => {
        if (answers.forestryMigrate) {
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
    })
  }
  const answers = await prompts(questions)
  return answers as {
    forestryMigrate: boolean
    frontMatterFormat?: 'yaml' | 'toml' | 'json'
  }
}

export const askTinaSetupPrompts = async (params: {
  frameworkName: string
  config: Config
}) => {
  const questions: PromptObject[] = [
    {
      name: 'typescript',
      type: 'confirm',
      initial: true,
      message:
        'Would you like to use Typescript for your Tina Configuration (Recommended)?',
    },
  ]
  // if we don't know the public folder, ask for it
  if (!params.config.publicFolder) {
    questions.push({
      name: 'publicFolder',
      type: 'text',
      initial: 'public',
      message:
        `Where are public assets stored? (default: "public")\n` +
        logText(
          `Not sure what value to use? Refer to our "Frameworks" doc: ${linkText(
            'https://tina.io/docs/integration/frameworks/#configuring-tina-with-each-framework'
          )}`
        ),
    })
  }
  const answers = await prompts(questions)
  return answers as {
    typescript: boolean
    publicFolder?: string
  }
}

export const askIfUsingSelfHosted = async () => {
  const answers = await prompts([
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
  ])
  return answers as { hosting: 'tina-cloud' | 'self-host' }
}

const tinaCloudSetupQuestions: PromptObject[] = [
  {
    name: 'clientId',
    type: 'text',
    message: `What is your Tina Cloud Client ID? (Hit enter to skip and set up yourself later)\n${logText(
      "Don't have a Client ID? Create one here: "
    )}${linkText('https://app.tina.io/projects/new')}`,
    initial: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  },
  {
    name: 'token',
    type: 'text',
    message: (prev) =>
      `What is your Tina Cloud Read Only Token?\n${logText(
        "Don't have a Read Only Token? Create one here: "
      )}${linkText(`https://app.tina.io/projects/${prev || '[XXX]'}/tokens`)}`,
    initial: process.env.TINA_TOKEN,
  },
]

export const askTinaCloudSetup = async () => {
  const answers = await prompts(tinaCloudSetupQuestions)
  return answers as { clientId?: string; token?: string }
}

interface importStatement {
  imported: string[]
  from: string
}
interface PromptGitProvider {
  gitProviderClassText: string
  imports?: importStatement[]
}

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
      }),`,
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

interface PromptDatabaseAdapter {
  databaseAdapterClassText: string
  imports?: importStatement[]
}
const supportedDatabaseAdapters: {
  'upstash-redis': PromptDatabaseAdapter
  mongodb: PromptDatabaseAdapter
  other: PromptDatabaseAdapter
} = {
  ['upstash-redis']: {
    databaseAdapterClassText: `new Redis({
            url: process.env.KV_REST_API_URL || 'http://localhost:8079',
            token: process.env.KV_REST_API_TOKEN || 'example_token',
          }),
          debug: process.env.DEBUG === 'true' || false,
        }),`,
    imports: [
      {
        imported: ['RedisLevel'],
        from: 'upstash-redis-level',
      },
      {
        imported: ['Redis'],
        from: '@upstash/redis',
      },
    ],
  },
  mongodb: {
    databaseAdapterClassText: `new MongodbLevel<string, Record<string, any>>({
        // If you are not using branches you could pass a static collection name. ie: "tinacms"
        collectionName: \`tinacms-\${branchName}\`,
        dbName: 'tinacms',
        mongoUri: process.env.MONGODB_URI as string,
      })`,
    imports: [{ from: 'mongodb-level', imported: ['MongodbLevel'] }],
  },
  other: {
    databaseAdapterClassText: '',
  },
}

const databaseAdapterUpdateConfig: {
  [key in keyof typeof supportedDatabaseAdapters]: ({
    config,
  }: {
    config: Config
  }) => Promise<void>
} = {
  other: async (_args) => {},
  mongodb: async ({ config }) => {
    const result = await prompts([
      {
        name: 'mongoDBUri',
        type: 'text',
        message: `What is the MongoDB URI(Hit enter to skip and set up yourself later)`,
        initial: process.env.MONGODB_URI,
      },
    ])
    config.mongoDBUri = result.mongoDBUri
  },
  'upstash-redis': async ({ config }) => {
    const result = await prompts([
      {
        name: 'kvRestApiUrl',
        type: 'text',
        message: `What is the KV (Redis) Rest API URL? (Hit enter to skip and set up yourself later)`,
        initial: process.env.KV_REST_API_URL,
      },
      {
        name: 'kvRestApiToken',
        type: 'text',
        message: `What is the KV (Redis) Rest API Token? (Hit enter to skip and set up yourself later)`,
        initial: process.env.KV_REST_API_TOKEN,
      },
    ])
    config.kvRestApiUrl = result.kvRestApiUrl
    config.kvRestApiToken = result.kvRestApiToken
  },
}
export const chooseDatabaseAdapter = async ({
  framework,
  config,
}: {
  config: Config
  framework: Framework
}) => {
  const answers = await prompts([
    {
      name: 'dataLayerAdapter',
      message: 'Select a self-hosted Database Adapter',
      type: 'select',
      choices: [
        {
          title: 'Vercel KV/Upstash Redis',
          value: 'upstash-redis',
        },
        {
          title: 'MongoDB',
          value: 'mongodb',
        },
        {
          title: "I'll create my own database adapter",
          value: 'other',
        },
      ],
    },
  ])
  if (typeof answers.dataLayerAdapter === 'undefined') {
    throw new Error('Database adapter is required')
  }
  const chosen = answers.dataLayerAdapter as
    | 'upstash-redis'
    | 'mongodb'
    | 'other'

  await databaseAdapterUpdateConfig[chosen]({ config })

  return supportedDatabaseAdapters[chosen]
}

interface PromptAuthenticationProvider {
  // For tina/config file
  configAuthenticationClass?: string
  configImports?: importStatement[]
  // for /api/tina/[...routes] file
  backendAuthentication?: string
  backendAuthenticationImports?: importStatement[]
}

export const supportedAuthenticationProviders: {
  'tina-cloud': PromptAuthenticationProvider
  'next-auth': PromptAuthenticationProvider
  other: PromptAuthenticationProvider
} = {
  other: {},
  'tina-cloud': {
    configAuthenticationClass: '',
    backendAuthentication: 'TODO',
  },
  'next-auth': {
    configAuthenticationClass: `new UsernamePasswordAuthJSProvider()`,
    configImports: [
      {
        imported: ['UsernamePasswordAuthJSProvider'],
        from: 'tinacms-authjs/dist/tinacms',
      },
    ],
    backendAuthentication: `AuthJsBackendAuthentication({
        authOptions: TinaAuthJSOptions({
          databaseClient: databaseClient,
          secret: process.env.NEXTAUTH_SECRET,
        }),
      })`,
    backendAuthenticationImports: [
      {
        from: 'tinacms-authjs',
        imported: ['AuthJsBackendAuthentication', 'TinaAuthJSOptions'],
      },
    ],
  },
}

const authenticationProviderUpdateConfig: {
  [key in keyof typeof supportedAuthenticationProviders]: ({
    config,
  }: {
    config: Config
  }) => Promise<void>
} = {
  other: async () => {},
  'tina-cloud': async ({ config }) => {
    const result = await prompts(tinaCloudSetupQuestions)
    config.clientId = result.clientId
    config.token = result.token
  },
  'next-auth': async ({ config }) => {
    const result = await prompts([
      {
        name: 'nextAuthSecret',
        type: 'text',
        message: `What is the NextAuth.js Secret? (Hit enter to use a randomly generated secret)`,
        initial:
          process.env.NEXTAUTH_SECRET ||
          crypto.lib.WordArray.random(16).toString(),
      },
    ])
    config.nextAuthSecret = result.nextAuthSecret
  },
}
export const chooseAuthenticationProvider = async ({
  framework,
  config,
}: {
  config: Config
  framework: Framework
}) => {
  const choices = [
    {
      title: 'Tina Cloud for Auth',
      value: 'tina-cloud',
    },
  ]
  if (framework.name === 'next') {
    choices.push({
      value: 'next-auth',
      title: 'Next Auth (recommended)',
    })
  }
  choices.push({
    value: 'other',
    title: 'I will create my own authentication provider',
  })
  const authProviderChoice = await prompts([
    {
      name: 'authProvider',
      type: 'select',
      choices,
    },
  ])
  if (typeof authProviderChoice.authProvider === 'undefined') {
    throw new Error('Authentication provider is required')
  }
  const authProvider =
    supportedAuthenticationProviders[
      authProviderChoice.authProvider as 'tina-cloud' | 'next-auth' | 'other'
    ]

  await authenticationProviderUpdateConfig[authProviderChoice.authProvider]({
    config,
  })

  return authProvider
}
