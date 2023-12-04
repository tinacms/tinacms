import prompts from 'prompts'
import type { PromptObject } from 'prompts'
import { linkText, logText } from '../../../utils/theme'
import { Framework, InitEnvironment } from '../'
import { Config, ImportStatement } from './types'

export * from './askTinaCloudSetup'
export * from './types'
export * from './gitProvider'
export * from './databaseAdapter'
export * from './authProvider'

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
          title: 'Self-Hosted',
          value: 'self-host',
        },
      ],
      message:
        'Do you want to host your project on Tina Cloud or self-host? (With self-hosting, the graphql api, auth and database will be hosted on your own server.)',
    },
  ])
  return answers as { hosting: 'tina-cloud' | 'self-host' }
}

export const makeImportString = (imports?: ImportStatement[]) => {
  if (!imports) {
    return ''
  }
  const filtered = imports.filter((x) => x.imported.length > 0)
  if (filtered.length === 0) {
    return ''
  }
  return filtered
    .map((x) => {
      return `import { ${x.imported.join(',')} } from '${x.from}'`
    })
    .join('\n')
}
