import path from 'path'
import { generateCollections } from '../forestry-migrate'
import { addVariablesToCode } from '../forestry-migrate/util/codeTransformer'
import { logger } from '../../logger'
import {
  cmdText,
  focusText,
  indentedCmd,
  indentText,
  linkText,
  logText,
  titleText,
} from '../../utils/theme'
import { Telemetry } from '@tinacms/metrics'
import fs from 'fs-extra'
import { writeGitignore } from '../../next/commands/codemod-command'
import { templates as NextTemplates } from './templates/next'
import { ConfigTemplateArgs, generateConfig } from './templates/config'
import { databaseTemplate } from './templates/database'
import { nextApiRouteTemplate } from './templates/tinaNextRoute'
import { helloWorldPost } from './templates/content'
import { format } from 'prettier'
import { extendNextScripts } from '../../utils/script-helpers'
import {
  Framework,
  GeneratedFile,
  InitEnvironment,
  InitParams,
  ReactiveFramework,
} from './index'
import { Config } from './prompts'
import { addSelfHostedTinaAuthToConfig } from './codegen'

async function apply({
  env,
  params,
  config,
}: {
  env: InitEnvironment
  params: InitParams
  config: Config
}) {
  if (config.framework.name === 'other' && config.hosting === 'self-host') {
    logger.error(
      logText(
        'Self-hosted Tina requires init setup only works with next.js right now. Please check out the docs for info on how to setup Tina on another framework: https://tina.io/docs/self-hosted/existing-site/'
      )
    )
    return
  }
  const { pathToForestryConfig, noTelemetry, baseDir = '' } = params
  let collections: string | null | undefined
  let templateCode: string | null | undefined
  let extraText: string | null | undefined

  let isForestryMigration = false
  if (env.forestryConfigExists) {
    // CollectionsString is the string that will be added to the tina config
    // importStatements are the import statements that will be added to the tina config
    // templateCodeString is the string that will be added to the template.{ts,js} file
    const res = await forestryMigrate({
      frontMatterFormat: env.frontMatterFormat || config.frontMatterFormat,
      pathToForestryConfig,
      usingTypescript: config.typescript,
    })
    if (res) {
      templateCode = res.templateCodeString
      collections = res.collectionString
      extraText = res.importStatements
      isForestryMigration = true
    }
  }

  // Report telemetry
  await reportTelemetry({
    usingTypescript: config.typescript,
    hasForestryConfig: env.forestryConfigExists,
    noTelemetry: noTelemetry,
  })

  // if no package.json, init
  if (!env.packageJSONExists) {
    await createPackageJSON()
  }

  // if no .gitignore, create one
  if (!env.gitIgnoreExists) {
    await createGitignore({ baseDir })
  } else {
    const itemsToAdd = []
    if (!env.gitIgnoreNodeModulesExists) {
      itemsToAdd.push('node_modules')
    }
    if (!env.gitIgnoreEnvExists) {
      itemsToAdd.push('.env')
    }
    if (itemsToAdd.length > 0) {
      await updateGitIgnore({ baseDir, items: itemsToAdd })
    }
  }

  // if we are migrating forestry files add the tina/template file
  if (isForestryMigration && !env.tinaConfigExists) {
    await addTemplateFile({
      generatedFile: env.generatedFiles['templates'],
      content: templateCode,
      config,
    })
  }
  const usingDataLayer = config.hosting === 'self-host'

  if (usingDataLayer) {
    // add tina/database file
    await addDatabaseFile({
      config,
      generatedFile: env.generatedFiles['database'],
    })
    // add pages/api/tina/[...routes].ts file
    await addNextApiRoute({
      env,
      config,
      generatedFile: env.generatedFiles['next-api-handler'],
    })
    // add content/users/index.json file
    await addTemplateFile({
      config,
      generatedFile: env.generatedFiles['users-json'],
      content: JSON.stringify(
        {
          users: [
            {
              name: 'Tina User',
              email: 'user@tina.io',
              username: 'tinauser',
              password: {
                value: 'tinarocks',
                passwordChangeRequired: true,
              },
            },
          ],
        },
        null,
        2
      ),
    })
  }

  // add NextJS Demo file (First time init only)
  if (!env.forestryConfigExists && !env.tinaConfigExists) {
    // add /content/posts/hello-world.md
    await addContentFile({ config, env })
  }

  // add nextJs example code (First time init only)
  if (
    config.framework.reactive &&
    addReactiveFile[config.framework.name] &&
    !env.tinaConfigExists
  ) {
    await addReactiveFile[config.framework.name as ReactiveFramework]({
      baseDir,
      config,
      env,
      dataLayer: usingDataLayer,
      generatedFile: env.generatedFiles['reactive-example'],
    })
  }

  await addDependencies(config, env, params)

  if (!env.tinaConfigExists) {
    // add tina/config.{js,ts}]
    await addConfigFile({
      configArgs: {
        config,
        publicFolder: path.join(
          path.relative(process.cwd(), pathToForestryConfig),
          config.publicFolder
        ),
        collections,
        extraText,
        isLocalEnvVarName: config.isLocalEnvVarName,
        isForestryMigration,
        selfHosted: usingDataLayer,
      },
      baseDir,
      generatedFile: env.generatedFiles['config'],
      config,
    })
  }

  if (
    // Are we running tinacms init backend
    params.isBackendInit &&
    // Do the user choose the 'self-host' option
    config.hosting === 'self-host' &&
    // the user did not choose the 'tina-cloud' auth provider
    (config.authProvider?.name || '') !== 'tina-cloud'
  ) {
    await addSelfHostedTinaAuthToConfig(config, env.generatedFiles['config'])
  }

  logNextSteps({
    config: config,
    isBackend: params.isBackendInit,
    dataLayer: usingDataLayer,
    packageManager: config.packageManager,
    framework: config.framework,
  })
}

const forestryMigrate = async ({
  pathToForestryConfig,
  usingTypescript,
  frontMatterFormat,
}: {
  usingTypescript: boolean
  pathToForestryConfig: string
  frontMatterFormat: 'yaml' | 'toml' | 'json'
}) => {
  const { collections, importStatements, templateCode } =
    await generateCollections({
      pathToForestryConfig,
      usingTypescript,
      frontMatterFormat,
    })

  // print errors
  // This error is handled now so we do not need to print it
  // ErrorSingleton.getInstance().printCollectionNameErrors()
  const JSONString = JSON.stringify(collections, null, 2)

  const { code } = addVariablesToCode(JSONString)

  return {
    collectionString: code,
    importStatements,
    templateCodeString: templateCode,
  }
}

const reportTelemetry = async ({
  hasForestryConfig,
  noTelemetry,
  usingTypescript,
}: {
  usingTypescript: boolean
  noTelemetry: boolean
  hasForestryConfig: boolean
}) => {
  if (noTelemetry) {
    logger.info(logText('Telemetry disabled'))
  }
  const telemetry = new Telemetry({ disabled: noTelemetry })
  const schemaFileType = usingTypescript ? 'ts' : 'js'
  await telemetry.submitRecord({
    event: {
      name: 'tinacms:cli:init:invoke',
      schemaFileType,
      hasForestryConfig,
    },
  })
}

const createPackageJSON = async () => {
  logger.info(logText('No package.json found, creating one'))
  await execShellCommand(`npm init --yes`)
}
const createGitignore = async ({ baseDir }: { baseDir: string }) => {
  logger.info(logText('No .gitignore found, creating one'))
  fs.outputFileSync(path.join(baseDir, '.gitignore'), 'node_modules')
}

const updateGitIgnore = async ({
  baseDir,
  items,
}: {
  baseDir: string
  items: string[]
}) => {
  logger.info(logText(`Adding ${items.join(',')} to .gitignore`))
  const gitignoreContent = fs
    .readFileSync(path.join(baseDir, '.gitignore'))
    .toString()
  const newGitignoreContent = [...gitignoreContent.split('\n'), ...items].join(
    '\n'
  )
  await fs.writeFile(path.join(baseDir, '.gitignore'), newGitignoreContent)
}
const addDependencies = async (
  config: Config,
  env: InitEnvironment,
  params: InitParams
) => {
  const { packageManager } = config
  const tagVersion = params.tinaVersion ? `@${params.tinaVersion}` : ''
  let deps = []
  let devDeps = []

  // If TinaCMS is already installed, don't add it again
  if (!env.hasTinaDeps) {
    deps.push('tinacms')
    devDeps.push('@tinacms/cli')
  }

  if (config.typescript) {
    devDeps.push('@types/node')
  }

  if (config.hosting === 'self-host') {
    deps.push('@tinacms/datalayer')
  }

  // Add deps from database adapter, auth provider, and git provider
  deps.push(
    ...(config.databaseAdapter?.imports?.map((x) => x.packageName) || [])
  )
  deps.push(...(config.authProvider?.peerDependencies || []))
  deps.push(
    ...(config.authProvider?.backendAuthProviderImports?.map(
      (x) => x.packageName
    ) || [])
  )
  deps.push(
    ...(config.authProvider?.configImports?.map((x) => x.packageName) || [])
  )
  deps.push(...(config.gitProvider?.imports?.map((x) => x.packageName) || []))

  // add tag version if this is a pr tagged version
  if (tagVersion) {
    deps = deps.map((dep) =>
      dep.indexOf('tina') >= 0 ? `${dep}${tagVersion}` : dep
    )
    devDeps = devDeps.map((dep) =>
      dep.indexOf('tina') >= 0 ? `${dep}${tagVersion}` : dep
    )
  }

  // dependencies
  let packageManagers = {
    pnpm: process.env.USE_WORKSPACE
      ? `pnpm add ${deps.join(' ')} --workspace`
      : `pnpm add ${deps.join(' ')}`,
    npm: `npm install ${deps.join(' ')}`,
    yarn: `yarn add ${deps.join(' ')}`,
  }

  if (packageManagers[packageManager] && deps.length > 0) {
    logger.info(logText('Adding dependencies, this might take a moment...'))
    logger.info(indentedCmd(`${logText(packageManagers[packageManager])}`))
    await execShellCommand(packageManagers[packageManager])
  }

  // dev dependencies
  if (devDeps.length > 0) {
    packageManagers = {
      pnpm: process.env.USE_WORKSPACE
        ? `pnpm add -D ${devDeps.join(' ')} --workspace`
        : `pnpm add -D ${devDeps.join(' ')}`,
      npm: `npm install -D ${devDeps.join(' ')}`,
      yarn: `yarn add -D ${devDeps.join(' ')}`,
    }
    if (packageManagers[packageManager]) {
      logger.info(
        logText('Adding dev dependencies, this might take a moment...')
      )
      logger.info(indentedCmd(`${logText(packageManagers[packageManager])}`))
      await execShellCommand(packageManagers[packageManager])
    }
  }
}

const writeGeneratedFile = async ({
  generatedFile,
  overwrite,
  content,
  typescript,
}: {
  generatedFile: GeneratedFile
  overwrite: boolean
  content: string
  typescript: boolean
}) => {
  const { exists, path, parentPath } = generatedFile.resolve(typescript)
  if (exists) {
    if (overwrite) {
      logger.info(`Overwriting file at ${path}... ✅`)
      fs.outputFileSync(path, content)
    } else {
      logger.info(`Not overwriting file at ${path}.`)
      logger.info(
        logText(`Please add the following to ${path}:\n${indentText(content)}}`)
      )
    }
  } else {
    logger.info(`Adding file at ${path}... ✅`)
    await fs.ensureDir(parentPath)
    fs.outputFileSync(path, content)
  }
}

const addConfigFile = async ({
  baseDir,
  configArgs,
  generatedFile,
  config,
}: {
  baseDir: string
  configArgs: ConfigTemplateArgs
  generatedFile: GeneratedFile
  config: Config
}) => {
  const content = format(generateConfig(configArgs), {
    parser: 'babel',
  })
  await writeGeneratedFile({
    overwrite: config.overwriteList?.includes('config'),
    generatedFile,
    content,
    typescript: config.typescript,
  })
  const { exists } = generatedFile.resolve(config.typescript)
  if (!exists) {
    await writeGitignore(baseDir)
  }
}

const addDatabaseFile = async ({
  config,
  generatedFile,
}: {
  config: Config
  generatedFile: GeneratedFile
}) => {
  await writeGeneratedFile({
    generatedFile,
    overwrite: config.overwriteList?.includes('database'),
    content: databaseTemplate({ config }),
    typescript: config.typescript,
  })
}
const addNextApiRoute = async ({
  config,
  generatedFile,
  env,
}: {
  env: InitEnvironment
  config: Config
  generatedFile: GeneratedFile
}) => {
  const content = format(nextApiRouteTemplate({ config, env }), {
    parser: 'babel',
  })
  await writeGeneratedFile({
    generatedFile,
    overwrite: config.overwriteList?.includes('next-api-handler'),
    content,
    typescript: config.typescript,
  })
}

// Adds tina/template.{ts,js} file
export const addTemplateFile = async ({
  content,
  generatedFile,
  config,
}: {
  content: string
  generatedFile: GeneratedFile
  config: Config
}) => {
  await writeGeneratedFile({
    generatedFile,
    overwrite: config.overwriteList?.includes(generatedFile.generatedFileType),
    content,
    typescript: config.typescript,
  })
}

const addContentFile = async ({
  config,
  env,
}: {
  config: Config
  env: InitEnvironment
}) => {
  await writeGeneratedFile({
    generatedFile: {
      javascriptExists: false,
      typescriptExists: false,
      fullPathJS: '',
      fullPathTS: '',
      generatedFileType: 'sample-content',
      name: '',
      parentPath: '',
      get resolve() {
        return () => ({
          exists: env.sampleContentExists,
          path: env.sampleContentPath,
          parentPath: path.dirname(env.sampleContentPath),
        })
      },
    },
    overwrite: config.overwriteList?.includes('sample-content'),
    content: helloWorldPost,
    typescript: false,
  })
}

const logNextSteps = ({
  config,
  dataLayer: _datalayer,
  framework,
  packageManager,
  isBackend,
}: {
  config: Config
  isBackend: boolean
  dataLayer: boolean
  packageManager: string
  framework: Framework
}) => {
  if (isBackend) {
    logger.info(focusText(`\n${titleText(' TinaCMS ')} backend initialized!`))
    logger.info(
      'Please add the following environment variables to your .env file'
    )
    logger.info(
      indentText(
        config.envVars
          .map((x) => {
            return `${x.key}=${x.value || '***'}`
          })
          .join('\n')
      )
    )
    logger.info(
      'If you are deploying to vercel make sure to add the environment variables to your project.'
    )
    logger.info('Make sure  to push tina-lock.json to your GitHub repo')
    logger.info('You can now run your build command and deploy your site.')
  } else {
    logger.info(focusText(`\n${titleText(' TinaCMS ')} has been initialized!`))
    logger.info(
      'To get started run: ' +
        cmdText(frameworkDevCmds[framework.name]({ packageManager }))
    )
    logger.info(
      'To get your site production ready, run: ' +
        cmdText(`tinacms init backend`)
    )
    logger.info(
      `\nOnce your site is running, access the CMS at ${linkText(
        '<YourDevURL>/admin/index.html'
      )}`
    )
  }
}

const other = ({ packageManager }: { packageManager: string }) => {
  const packageManagers = {
    pnpm: `pnpm`,
    npm: `npx`, // npx is the way to run executables that aren't in your "scripts"
    yarn: `yarn`,
  }
  return `${packageManagers[packageManager]} tinacms dev -c "<your dev command>"`
}

const frameworkDevCmds: {
  [key in Framework['name']]: (args?: { packageManager: string }) => string
} = {
  other,
  hugo: other,
  jekyll: other,
  next: ({ packageManager }: { packageManager: string }) => {
    const packageManagers = {
      pnpm: `pnpm`,
      npm: `npm run`, // npx is the way to run executables that aren't in your "scripts"
      yarn: `yarn`,
    }
    return `${packageManagers[packageManager]} dev`
  },
}

type AddReactiveParams = {
  baseDir: string
  config: Config
  env: InitEnvironment
  dataLayer: boolean
  generatedFile: GeneratedFile
}

const addReactiveFile: {
  [key in ReactiveFramework]: (params: AddReactiveParams) => Promise<void>
} = {
  next: async ({
    generatedFile,
    config,
    env,
    baseDir,
    dataLayer,
  }: AddReactiveParams) => {
    const packageJsonPath = path.join(baseDir, 'package.json')
    await writeGeneratedFile({
      generatedFile,
      typescript: config.typescript,
      overwrite: config.overwriteList?.includes(
        generatedFile.generatedFileType
      ),
      content: NextTemplates['demo-post-page']({
        usingSrc: env.usingSrc,
        dataLayer,
      }),
    })
    logger.info('Adding a nextjs example... ✅')

    // 4. update the users package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString())
    const scripts = packageJson.scripts || {}
    const updatedPackageJson = JSON.stringify(
      {
        ...packageJson,
        scripts: extendNextScripts(scripts, {
          isLocalEnvVarName: config.isLocalEnvVarName,
          addSetupUsers: config.authProvider?.name === 'next-auth',
        }),
      },
      null,
      2
    )
    fs.writeFileSync(packageJsonPath, updatedPackageJson)
  },
}

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
export function execShellCommand(cmd): Promise<string> {
  const exec = require('child_process').exec
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      }
      resolve(stdout ? stdout : stderr)
    })
  })
}

export default apply
