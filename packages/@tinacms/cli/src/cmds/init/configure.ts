import { GeneratedFile, InitEnvironment } from '.'
import {
  askCommonSetUp,
  askForestryMigrate,
  askIfUsingSelfHosted,
  askTinaCloudSetup,
  askTinaSetupPrompts,
  chooseAuthenticationProvider,
  chooseDatabaseAdapter,
  chooseGitProvider,
  Config,
} from './prompts'
import { logger } from '../../logger'

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

async function configure(
  env: InitEnvironment,
  opts: { debug?: boolean; isBackend?: boolean }
) {
  if (opts.isBackend && !env.tinaConfigExists) {
    logger.info('Looks like Tina has not been setup, setting up now...')
  }

  if (env.tinaConfigExists && !opts.isBackend) {
    logger.info(
      `Tina config already exists, skipping setup. (If you want to init tina from scratch, delete your tina config file and run this command again)`
    )
    process.exit(0)
  }

  const skipTinaSetupCommands = env.tinaConfigExists

  const { framework, packageManager } = await askCommonSetUp()
  const config: Config = {
    framework,
    packageManager,
    forestryMigrate: false,
    isLocalEnvVarName: 'TINA_PUBLIC_IS_LOCAL',
    // TODO: give this a better default
    typescript: false,
  }
  if (config.framework.name === 'next') {
    config.publicFolder = 'public'
  } else if (config.framework.name === 'hugo') {
    config.publicFolder = 'static'
  }

  if (skipTinaSetupCommands) {
    // We didn't ask if they wanted to use Typescript, but we can infer
    // from their existing config file
    config.typescript = env.generatedFiles.config.typescriptExists
  } else {
    const { typescript, publicFolder } = await askTinaSetupPrompts({
      frameworkName: framework.name,
      config: config,
    })
    config.typescript = typescript
    if (publicFolder) {
      config.publicFolder = publicFolder
    }
  }

  if (env.forestryConfigExists) {
    const { forestryMigrate, frontMatterFormat } = await askForestryMigrate({
      env,
      framework,
    })
    config.forestryMigrate = forestryMigrate
    config.frontMatterFormat = frontMatterFormat
  }

  // This means we are running `tinacms init backend`
  if (opts.isBackend) {
    const result = await askIfUsingSelfHosted()
    config.hosting = result.hosting
    if (result.hosting === 'tina-cloud') {
      const { clientId, token } = await askTinaCloudSetup()
      config.token = token
      config.clientId = clientId
    } else if (result.hosting === 'self-host') {
      config.gitProvider = await chooseGitProvider({ config })
      config.databaseAdapter = await chooseDatabaseAdapter({
        framework,
        config,
      })
      config.authenticationProvider = await chooseAuthenticationProvider({
        framework,
        config,
      })
    }
  }
  // If we are doing a backend init we can set the vercelKVNextAuthCredentialsKey default
  if (opts.isBackend) {
    config.vercelKVNextAuthCredentialsKey =
      process.env.NEXTAUTH_CREDENTIALS_KEY || 'tinacms_users'
  }

  config.nextAuthCredentialsProviderName = 'VercelKVCredentialsProvider'

  if (opts.debug) {
    console.log('Configuration:')
    console.log(JSON.stringify(config, null, 2))
  }

  if (env.nextAppDir && config.framework.name === 'next') {
    // instead of causing an error lets not generate an example
    config.framework.name = 'other'
  }

  return config

  // let config: Record<any, any> = await prompts(
  //   [
  //     // Always ask for the framework
  //     {
  //       name: 'framework',
  //       type: 'select',
  //       message: 'What framework are you using?',
  //       choices: [
  //         { title: 'Next.js', value: { name: 'next', reactive: true } },
  //         { title: 'Hugo', value: { name: 'hugo', reactive: false } },
  //         { title: 'Jekyll', value: { name: 'jekyll', reactive: false } },
  //         {
  //           title: 'Other (SSG frameworks like gatsby, etc.)',
  //           value: { name: 'other', reactive: false },
  //         },
  //       ] as { title: string; value: Framework }[],
  //     },
  //     {
  //       name: 'packageManager',
  //       type: 'select',
  //       message: 'Choose your package manager',
  //       choices: [
  //         { title: 'PNPM', value: 'pnpm' },
  //         { title: 'Yarn', value: 'yarn' },
  //         { title: 'NPM', value: 'npm' },
  //       ],
  //     },

  //     // only setup TinaCMS if they don't have a tina config
  //     ...(skipTinaSetupCommands ? [] : tinaSetupPrompts),
  //     // Only add the backend init questions if they are running the backend init command
  //     ...(opts.isBackend ? backendSetupCommands : []),
  //     // tina/config.ts
  //     ...generatedFileOverwritePrompt({
  //       condition: (_) => !env.tinaConfigExists,
  //       configName: 'Config',
  //       generatedFile: env.generatedFiles['config'],
  //     }),
  //     // tina/database.ts
  //     ...generatedFileOverwritePrompt({
  //       condition: (answers) => !!(answers.hosting === 'self-host'),
  //       configName: 'Database',
  //       generatedFile: env.generatedFiles['database'],
  //     }),
  //     // tina/auth.ts
  //     ...generatedFileOverwritePrompt({
  //       condition: (answers) => !!answers.nextAuthProvider,
  //       configName: 'Auth',
  //       generatedFile: env.generatedFiles['auth'],
  //     }),
  //     // pages/api/gql.ts
  //     ...generatedFileOverwritePrompt({
  //       condition: (answers) => !!(answers.hosting === 'self-host'),
  //       configName: 'GqlApiHandler',
  //       generatedFile: env.generatedFiles['gql-api-handler'],
  //     }),
  //     // pages/api/auth/[...nextauth].ts
  //     ...generatedFileOverwritePrompt({
  //       condition: (answers) => !!answers.nextAuthProvider,
  //       configName: 'NextAuthApiHandler',
  //       generatedFile: env.generatedFiles['next-auth-api-handler'],
  //     }),
  //     // pages/auth/signin.tsx
  //     ...generatedFileOverwritePrompt({
  //       condition: (answers) =>
  //         answers.nextAuthProvider === 'vercel-kv-credentials-provider',
  //       configName: 'VercelKVCredentialsProviderSignin',
  //       generatedFile:
  //         env.generatedFiles['vercel-kv-credentials-provider-signin'],
  //     }),
  //     // pages/auth/register.tsx
  //     ...generatedFileOverwritePrompt({
  //       condition: (answers) =>
  //         answers.nextAuthProvider === 'vercel-kv-credentials-provider',
  //       configName: 'VercelKVCredentialsProviderRegister',
  //       generatedFile:
  //         env.generatedFiles['vercel-kv-credentials-provider-register'],
  //     }),
  //     // pages/auth/tw.module.css
  //     ...generatedFileOverwritePrompt({
  //       condition: (answers) =>
  //         answers.nextAuthProvider === 'vercel-kv-credentials-provider',
  //       configName: 'VercelKVCredentialsProviderTailwindCSS',
  //       generatedFile:
  //         env.generatedFiles['vercel-kv-credentials-provider-tailwindcss'],
  //     }),
  //     // pages/api/credentials/register.ts
  //     ...generatedFileOverwritePrompt({
  //       condition: (answers) =>
  //         answers.nextAuthProvider === 'vercel-kv-credentials-provider',
  //       configName: 'VercelKVCredentialsProviderRegisterApiHandler',
  //       generatedFile:
  //         env.generatedFiles[
  //           'vercel-kv-credentials-provider-register-api-handler'
  //         ],
  //     }),
  //     // pages/demo/blog/[filename].tsx
  //     ...generatedFileOverwritePrompt({
  //       condition: (answers) => answers.framework.reactive,
  //       configName: 'ReactiveExample',
  //       generatedFile: env.generatedFiles['reactive-example'],
  //     }),
  //     {
  //       name: 'overwriteSampleContent',
  //       type: (_) =>
  //         env.sampleContentExists && !env.tinaConfigExists ? 'confirm' : null,
  //       message: `Found existing file at ${env.sampleContentPath}. Would you like to overwrite?`,
  //     },
  //   ],
  //   promptOptions
  // )
}

export default configure
