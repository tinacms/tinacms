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
import { askOverwriteGenerateFiles } from './prompts/generatedFiles'

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
  const firstTimeSetup = !env.tinaConfigExists
  // ask about generated files
  // TODO: We directly repeat this logic in the apply function we are writing the files. Might be good to refactor this
  const generatedFilesInUse: GeneratedFile[] = []
  if (env.tinaConfigExists) {
    generatedFilesInUse.push(env.generatedFiles.config)
  }
  if (config.hosting === 'self-host') {
    generatedFilesInUse.push(env.generatedFiles.database)
    generatedFilesInUse.push(env.generatedFiles['next-api-handler'])
  }
  if (config.framework.reactive && firstTimeSetup) {
    generatedFilesInUse.push(env.generatedFiles['reactive-example'])
  }
  if (env.sampleContentExists && firstTimeSetup) {
    generatedFilesInUse.push(env.generatedFiles['sample-content'])
  }

  config.overwriteList = await askOverwriteGenerateFiles({
    generatedFiles: generatedFilesInUse,
    config,
  })

  return config
}

export default configure
