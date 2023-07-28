import path from 'path'
import { generateCollections } from '../forestry-migrate'
import { addVariablesToCode } from '../forestry-migrate/util/codeTransformer'
import { log, logger } from '../../logger'
import {
  cmdText,
  focusText,
  indentedCmd,
  linkText,
  logText,
  titleText,
} from '../../utils/theme'
import { Telemetry } from '@tinacms/metrics'
import fs from 'fs-extra'
import { writeGitignore } from '../../next/commands/codemod-command'
import { templates as AssetsTemplates } from './templates/assets'
import {
  templates as AuthTemplates,
  Variables as AuthTemplateVariables,
} from './templates/auth'
import {
  configExamples,
  ConfigTemplateOptions,
  ConfigTemplateVariables,
} from './templates/config'
import { templates as DatabaseTemplates } from './templates/database'
import {
  templates as GQLTemplates,
  Variables as GQLTemplateVariables,
} from './templates/gql'
import { templates as NextTemplates } from './templates/next'
import { helloWorldPost } from './templates/content'
import { format } from 'prettier'
import { extendNextScripts } from '../../utils/script-helpers'
import { Framework, GeneratedFile, InitEnvironment, InitParams } from './index'

async function apply({
  env,
  params,
  config,
}: {
  env: InitEnvironment
  params: InitParams
  config: Record<any, any>
}) {
  const { pathToForestryConfig, noTelemetry, baseDir = '' } = params
  let collections: string | null | undefined
  let templateCode: string | null | undefined
  let extraText: string | null | undefined

  if (env.nextAppDir && config.framework.name === 'next') {
    console.log(
      `❌Error: the init command does not currently support the app dir. You will have to setup Tina manually`
    )
    process.exit(1)
  }

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
    let itemsToAdd = []
    if (!env.gitIgoreNodeModulesExists) {
      itemsToAdd.push('node_modules')
    }
    if (!env.gitIgnoreTinaEnvExists) {
      itemsToAdd.push('.env.tina')
    }
    if (!env.gitIgnoreEnvExists) {
      itemsToAdd.push('.env')
    }
    if (itemsToAdd.length > 0) {
      await updateGitIgnore({ baseDir, items: itemsToAdd })
    }
  }

  if (isForestryMigration) {
    await addTemplateFile({
      generatedFile: env.generatedFiles['templates'],
      content: templateCode,
      config,
    })
  }

  // add tina/config.{js,ts}]
  await addConfigFile({
    templateVariables: {
      // remove process fom pathToForestryConfig and add publicFolder
      publicFolder: path.join(
        path.relative(process.cwd(), pathToForestryConfig),
        config.publicFolder
      ),
      collections,
      extraText,
      isLocalEnvVarName: config.isLocalEnvVarName,
      nextAuthCredentialsProviderName: config.nextAuthCredentialsProviderName,
    },
    templateOptions: {
      nextAuth: config.nextAuth,
      isForestryMigration,
      selfHosted: config.dataLayer,
      dataLayer: config.dataLayer,
    },
    baseDir,
    framework: config.framework,
    generatedFile: env.generatedFiles['config'],
    config,
  })

  if (config.dataLayer) {
    await addDatabaseFile({
      config,
      generatedFile: env.generatedFiles['database'],
    })
    await addGqlApiHandler({
      config,
      generatedFile: env.generatedFiles['gql-api-handler'],
    })
  }

  if (config.nextAuthProvider) {
    await addAuthFile({
      config,
      generatedFile: env.generatedFiles['auth'],
    })

    await addNextAuthApiHandler({
      config,
      generatedFile: env.generatedFiles['next-auth-api-handler'],
      content: NextTemplates['next-auth-api-handler'](),
    })

    if (config.nextAuthProvider === 'vercel-kv-credentials-provider') {
      await addVercelKVCredentialsProviderFiles({
        generatedSignin:
          env.generatedFiles['vercel-kv-credentials-provider-signin'],
        generatedRegister:
          env.generatedFiles['vercel-kv-credentials-provider-register'],
        generatedTailwindCSS:
          env.generatedFiles['vercel-kv-credentials-provider-tailwindcss'],
        generatedRegisterApiHandler:
          env.generatedFiles[
            'vercel-kv-credentials-provider-register-api-handler'
          ],
        generatedTinaSVG: env.generatedFiles['tina.svg'],
        config,
      })
    }
  }

  if (!env.forestryConfigExists) {
    // add /content/posts/hello-world.md
    await addContentFile({ config, env })
  }

  if (config.framework.reactive) {
    await addReactiveFile[config.framework.name]({
      baseDir,
      framework: config.framework,
      usingSrc: env.usingSrc,
      usingTypescript: config.typescript,
      isLocalEnvVarName: config.isLocalEnvVarName,
      dataLayer: config.dataLayer,
      nextAuthProvider: config.nextAuthProvider,
    })
  }

  await addDependencies(config, env, params)

  logNextSteps({
    dataLayer: config.dataLayer,
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
  await fs.outputFileSync(
    path.join(baseDir, '.gitignore'),
    'node_modules\n.env.tina'
  )
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
  config: Record<any, any>,
  env: InitEnvironment,
  params: InitParams
) => {
  const tagVersion = params.tinaVersion ? `@${params.tinaVersion}` : ''
  const { dataLayer, dataLayerAdapter, nextAuth, packageManager } = config
  logger.info(logText('Adding dependencies, this might take a moment...'))
  let deps = [`tinacms`, '@tinacms/cli']
  let devDeps = []
  if (nextAuth) {
    deps.push('tinacms-next-auth', 'next-auth')
  }
  if (dataLayer) {
    deps.push('@tinacms/datalayer')
    deps.push('tinacms-gitprovider-github')
  }
  if (dataLayerAdapter === 'upstash-redis') {
    deps.push('upstash-redis-level')
    deps.push('@upstash/redis')
  }

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
  logger.info(indentedCmd(`${logText(packageManagers[packageManager])}`))
  await execShellCommand(packageManagers[packageManager])

  // dev dependencies
  if (devDeps.length > 0) {
    packageManagers = {
      pnpm: process.env.USE_WORKSPACE
        ? `pnpm add -D ${devDeps.join(' ')} --workspace`
        : `pnpm add -D ${devDeps.join(' ')}`,
      npm: `npm install -D ${devDeps.join(' ')}`,
      yarn: `yarn add -D ${devDeps.join(' ')}`,
    }
    logger.info(indentedCmd(`${logText(packageManagers[packageManager])}`))
    await execShellCommand(packageManagers[packageManager])
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
      await fs.outputFileSync(path, content)
    } else {
      logger.info(logText(`Not overwriting file at ${path}.`))
    }
  } else {
    logger.info(`Adding file at ${path}... ✅`)
    await fs.ensureDir(parentPath)
    await fs.outputFileSync(path, content)
  }
}

const addConfigFile = async ({
  baseDir,
  framework,
  templateOptions,
  templateVariables,
  generatedFile,
  config,
}: {
  baseDir: string
  framework: Framework
  templateOptions: ConfigTemplateOptions
  templateVariables: ConfigTemplateVariables
  generatedFile: GeneratedFile
  config: Record<any, any>
}) => {
  await writeGeneratedFile({
    overwrite: config.typescript
      ? config.overwriteConfigTS
      : config.overwriteConfigJS,
    generatedFile,
    content: configContent(framework, templateVariables, templateOptions),
    typescript: config.typescript,
  })
  const { exists } = generatedFile.resolve(config.typescript)
  if (!exists) {
    await writeGitignore(baseDir)
  }
}

const addAuthFile = async ({
  config,
  generatedFile,
}: {
  config: Record<any, any>
  generatedFile: GeneratedFile
}) => {
  const { nextAuthProvider, nextAuthCredentialsProviderName } = config
  const templateVariables = {
    nextAuthCredentialsProviderName,
  }
  await writeGeneratedFile({
    generatedFile,
    overwrite: config.typescript
      ? config.overwriteAuthTS
      : config.overwriteAuthJS,
    content: authContent(nextAuthProvider, templateVariables),
    typescript: config.typescript,
  })
}

const addDatabaseFile = async ({
  config,
  generatedFile,
}: {
  config: Record<any, any>
  generatedFile: GeneratedFile
}) => {
  const { isLocalEnvVarName } = config
  await writeGeneratedFile({
    generatedFile,
    overwrite: config.typescript
      ? config.overwriteDatabaseTS
      : config.overwriteDatabaseJS,
    content: DatabaseTemplates[config.dataLayerAdapter]({ isLocalEnvVarName }),
    typescript: config.typescript,
  })
}

const addGqlApiHandler = async ({ config, generatedFile }) => {
  let vars: GQLTemplateVariables = {
    isLocalEnvVarName: config.isLocalEnvVarName,
  }
  let content = GQLTemplates['custom'](vars)
  if (config.nextAuth) {
    content = GQLTemplates['tinacms-next-auth'](vars)
  } else if (config.clientId || config.token) {
    content = GQLTemplates['tina-cloud'](vars)
  }
  await writeGeneratedFile({
    generatedFile,
    overwrite: config.typescript
      ? config.overwriteGqlApiHandlerTS
      : config.overwriteGqlApiHandlerJS,
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
  config: Record<any, any>
}) => {
  await writeGeneratedFile({
    generatedFile,
    overwrite: config.typescript
      ? config.overwriteTemplatesTS
      : config.overwriteTemplatesJS,
    content,
    typescript: config.typescript,
  })
}

const addContentFile = async ({
  config,
  env,
}: {
  config: Record<any, any>
  env: InitEnvironment
}) => {
  await writeGeneratedFile({
    generatedFile: {
      javascriptExists: false,
      typescriptExists: false,
      fullPathJS: '',
      fullPathTS: '',
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
    overwrite: config.overwriteSampleContent,
    content: helloWorldPost,
    typescript: false,
  })
}

const logNextSteps = ({
  dataLayer,
  framework,
  packageManager,
}: {
  dataLayer: boolean
  packageManager: string
  framework: Framework
}) => {
  logger.info(focusText(`\n${titleText(' TinaCMS ')} has been initialized!`))
  if (dataLayer) {
    logger.info('Copy .env.tina to .env')
    logger.info(
      'If you are deploying to vercel make sure to add the environment variables to your project.'
    )
  }
  logger.info(
    'To get started run: ' +
      cmdText(frameworkDevCmds[framework.name]({ packageManager }))
  )
  logger.info('Make sure  to push tina-lock.json to your GitHub repo')
  logger.info(
    `\nOnce your site is running, access the CMS at ${linkText(
      '<YourDevURL>/admin/index.html'
    )}`
  )
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

const configContent = (
  framework: Framework,
  vars: ConfigTemplateVariables,
  opts: ConfigTemplateOptions
) => {
  return format(configExamples[framework.name](vars, opts), {
    parser: 'babel',
  })
}

const authContent = (authType: string, vars: AuthTemplateVariables) => {
  return format(AuthTemplates[authType](vars), {
    parser: 'babel',
  })
}

const addReactiveFile = {
  next: ({
    baseDir,
    isLocalEnvVarName,
    usingSrc,
    usingTypescript,
    dataLayer,
    nextAuthProvider,
  }: {
    baseDir: string
    isLocalEnvVarName: string
    usingSrc: boolean
    usingTypescript: boolean
    dataLayer: boolean
    nextAuthProvider: string
  }) => {
    const pagesPath = path.join(baseDir, usingSrc ? 'src' : '', 'pages')
    const packageJSONPath = path.join(baseDir, 'package.json')
    const tinaBlogPagePath = path.join(pagesPath, 'demo', 'blog')
    const tinaBlogPagePathFile = path.join(
      tinaBlogPagePath,
      `[filename].${usingTypescript ? 'tsx' : 'js'}`
    )
    if (!fs.pathExistsSync(tinaBlogPagePathFile)) {
      fs.mkdirpSync(tinaBlogPagePath)
      fs.writeFileSync(
        tinaBlogPagePathFile,
        NextTemplates['demo-post-page']({ usingSrc, dataLayer })
      )
    }
    logger.info('Adding a nextjs example... ✅')

    // 4. update the users package.json
    const pack = JSON.parse(fs.readFileSync(packageJSONPath).toString())
    const oldScripts = pack.scripts || {}
    const newPack = JSON.stringify(
      {
        ...pack,
        scripts: extendNextScripts(oldScripts, {
          isLocalEnvVarName,
          addSetupUsers: nextAuthProvider === 'vercel-kv-credentials-provider',
        }),
      },
      null,
      2
    )
    fs.writeFileSync(packageJSONPath, newPack)
  },
}

async function addNextAuthApiHandler({
  generatedFile,
  config,
  content,
}: {
  generatedFile: GeneratedFile
  config: Record<any, any>
  content: string
}) {
  await writeGeneratedFile({
    generatedFile,
    typescript: config.typescript,
    overwrite: config.typescript
      ? config.overwriteNextAuthApiHandlerTS
      : config.overwriteNextAuthApiHandlerTS,
    content,
  })
}

const addVercelKVCredentialsProviderFiles = async ({
  generatedSignin,
  generatedRegister,
  generatedTailwindCSS,
  generatedRegisterApiHandler,
  generatedTinaSVG,
  config,
}: {
  generatedSignin: GeneratedFile
  generatedRegister: GeneratedFile
  generatedTailwindCSS: GeneratedFile
  generatedRegisterApiHandler: GeneratedFile
  generatedTinaSVG: GeneratedFile
  config: Record<any, any>
}) => {
  await writeGeneratedFile({
    generatedFile: generatedSignin,
    overwrite: config.typescript
      ? config.overwriteVercelKVCredentialsProviderSigninTS
      : config.overwriteVercelKVCredentialsProviderSigninJS,
    content: NextTemplates['vercel-kv-credentials-provider-signin'](),
    typescript: config.typescript,
  })
  await writeGeneratedFile({
    generatedFile: generatedRegister,
    overwrite: config.typescript
      ? config.overwriteVercelKVCredentialsProviderRegisterTS
      : config.overwriteVercelKVCredentialsProviderRegisterJS,
    content: NextTemplates['vercel-kv-credentials-provider-register']({
      nextAuthCredentialsProviderName: config.nextAuthCredentialsProviderName,
    }),
    typescript: config.typescript,
  })
  await writeGeneratedFile({
    generatedFile: generatedTailwindCSS,
    overwrite: config.typescript
      ? config.overwriteVercelKVCredentialsProviderTailwindCSSTS
      : config.overwriteVercelKVCredentialsProviderTailwindCSSJS,
    content: NextTemplates['vercel-kv-credentials-provider-tailwindcss'](),
    typescript: config.typescript,
  })
  await writeGeneratedFile({
    generatedFile: generatedRegisterApiHandler,
    overwrite: config.typescript
      ? config.overwriteVercelKVCredentialsProviderRegisterApiHandlerTS
      : config.overwriteVercelKVCredentialsProviderRegisterApiHandlerJS,
    content:
      NextTemplates['vercel-kv-credentials-provider-register-api-handler'](),
    typescript: config.typescript,
  })
  await writeGeneratedFile({
    generatedFile: generatedTinaSVG,
    overwrite: true,
    content: AssetsTemplates['tina.svg'](),
    typescript: config.typescript,
  })
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
