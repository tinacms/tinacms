import path from 'path'
import { format } from 'prettier'
import {
  cmdText,
  focusText,
  indentedCmd,
  linkText,
  logText,
  titleText,
} from '../../utils/theme'
import { logger } from '../../logger'
import fs from 'fs-extra'
import { Telemetry } from '@tinacms/metrics'
import { nextPostPage } from './templates/next'
import { extendNextScripts } from '../../utils/script-helpers'
import {
  configExamples,
  ConfigTemplateOptions,
  ConfigTemplateVariables,
} from './templates/config'
import {
  templates as AuthTemplates,
  Variables as AuthTemplateVariables,
} from './templates/auth'
import { generateCollections } from '../forestry-migrate'
import { writeGitignore } from '../../next/commands/codemod-command'
import { addVariablesToCode } from '../forestry-migrate/util/codeTransformer'
import detectEnvironment from './environment'
import promptForInitConfiguration, { Framework } from './config'
import { helloWorldPost } from './templates/content'
import { CLICommand } from '../index'

type GeneratedFileType =
  | 'auth'
  | 'config'
  | 'templates'
  | 'vercel-kv-credentials-provider-signin'
  | 'vercel-kv-credentials-provider-register'

export type GeneratedFile = {
  fullPathJS: string
  fullPathTS: string
  name: string
  parentPath: string
  typescriptExists: boolean
  javascriptExists: boolean
}

export type InitEnvironment = {
  forestryConfigExists: boolean
  frontMatterFormat: 'yaml' | 'toml' | 'json'
  gitIgnoreExists: boolean
  gitIgoreNodeModulesExists: boolean
  packageJSONExists: boolean
  sampleContentExists: boolean
  sampleContentPath: string
  generatedFiles?: {
    [key in GeneratedFileType]: GeneratedFile
  }
  usingSrc: boolean
}

type InitParams = {
  rootPath: string
  pathToForestryConfig: string
  noTelemetry: boolean
  showSelfHosted?: boolean
  baseDir?: string
}

export const command = new CLICommand<InitEnvironment, InitParams>({
  async setup(params: InitParams): Promise<void> {
    logger.level = 'info'
    process.chdir(params.rootPath)
  },
  detectEnvironment({
    rootPath,
    pathToForestryConfig,
    baseDir = '',
  }: InitParams): Promise<InitEnvironment> {
    return detectEnvironment({
      baseDir,
      pathToForestryConfig,
      rootPath,
    })
  },
  configure(
    env: InitEnvironment,
    { showSelfHosted = false }: InitParams
  ): Promise<Record<any, any>> {
    return promptForInitConfiguration(env, { showSelfHosted })
  },
  apply(
    config: Record<any, any>,
    env: InitEnvironment,
    params: InitParams
  ): Promise<void> {
    return initStaticTina({
      env,
      params,
      config,
    })
  },
})

async function initStaticTina({
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
    if (!env.gitIgoreNodeModulesExists) {
      await addNodeModulesToGitignore({ baseDir })
    }
  }

  await addDependencies(config.packageManager, config.nextAuth)

  if (isForestryMigration) {
    const { fullPathTS, fullPathJS, javascriptExists, typescriptExists } =
      env.generatedFiles['templates']
    await addTemplateFile({
      templatesPath: config.typescript ? fullPathTS : fullPathJS,
      overwriteTemplates: config.typescript
        ? config.overwriteTemplatesTS
        : config.overwriteTemplatesJS,
      hasTemplates: config.typescript ? typescriptExists : javascriptExists,
      content: templateCode,
    })
  }

  // add tina/config.{js,ts}]
  const {
    fullPathTS: typescriptConfigPath,
    fullPathJS: javascriptConfigPath,
    javascriptExists: javascriptConfigExists,
    typescriptExists: typescriptConfigExists,
  } = env.generatedFiles['config']
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
      selfHosted: config.selfHosted,
    },
    baseDir,
    framework: config.framework,
    hasConfig: config.typescript
      ? typescriptConfigExists
      : javascriptConfigExists,
    overwriteConfig: config.typescript
      ? config.overwriteConfigTS
      : config.overwriteConfigJS,
    configPath: config.typescript ? typescriptConfigPath : javascriptConfigPath,
  })

  if (config.nextAuthProvider) {
    const { fullPathTS, fullPathJS, javascriptExists, typescriptExists } =
      env.generatedFiles['auth']
    await addAuthFile({
      templateVariables: {
        nextAuthCredentialsProviderName: config.nextAuthCredentialsProviderName,
      },
      authPath: config.typescript ? fullPathJS : fullPathTS,
      hasAuth: config.typescript ? typescriptExists : javascriptExists,
      nextAuthProvider: config.nextAuthProvider,
      overwriteAuth: config.typescript
        ? config.overwriteAuthTS
        : config.overwriteAuthJS,
    })
  }

  if (!env.forestryConfigExists) {
    // add /content/posts/hello-world.md
    await addContentFile({
      hasSampleContent: env.sampleContentExists,
      overwriteSampleContent: config.overwriteSampleContent,
      sampleContentPath: env.sampleContentPath,
    })
  }

  if (config.framework.reactive) {
    await addReactiveFile[config.framework.name]({
      baseDir,
      framework: config.framework,
      usingSrc: env.usingSrc,
      usingTypescript: config.typescript,
    })
  }

  logNextSteps({
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
  await fs.outputFileSync(path.join(baseDir, '.gitignore'), 'node_modules')
}

const addNodeModulesToGitignore = async ({ baseDir }: { baseDir: string }) => {
  logger.info(logText('Adding node_modules to .gitignore'))
  const gitignoreContent = fs
    .readFileSync(path.join(baseDir, '.gitignore'))
    .toString()
  const newGitignoreContent = [
    ...gitignoreContent.split('\n'),
    'node_modules',
  ].join('\n')
  await fs.writeFile(path.join(baseDir, '.gitignore'), newGitignoreContent)
}
const addDependencies = async (
  packageManager: 'pnpm' | 'yarn' | 'npm',
  nextAuth: boolean
) => {
  logger.info(logText('Adding dependencies, this might take a moment...'))
  const deps = ['tinacms', '@tinacms/cli']
  if (nextAuth) {
    deps.push('next-auth-tinacms', 'next-auth')
  }
  const packageManagers = {
    pnpm: process.env.USE_WORKSPACE
      ? `pnpm add ${deps.join(' ')} --workspace`
      : `pnpm add ${deps.join(' ')}`,
    npm: `npm install ${deps.join(' ')}`,
    yarn: `yarn add ${deps.join(' ')}`,
  }
  logger.info(indentedCmd(`${logText(packageManagers[packageManager])}`))
  await execShellCommand(packageManagers[packageManager])
}

const writeGeneratedFile = async ({
  exists,
  overwrite,
  path,
  content,
}: {
  exists: boolean
  overwrite: boolean
  path: string
  content: string
}) => {
  if (exists) {
    if (overwrite) {
      logger.info(logText(`Overwriting file at ${path}.`))
      await fs.outputFileSync(path, content)
    } else {
      logger.info(logText(`Not overwriting file at ${path}.`))
    }
  } else {
    logger.info(logText(`Adding file at ${path}`))
    await fs.outputFileSync(path, content)
  }
}

const addConfigFile = async ({
  baseDir,
  framework,
  hasConfig,
  overwriteConfig,
  configPath,
  templateOptions,
  templateVariables,
}: {
  baseDir: string
  framework: Framework
  hasConfig: boolean
  overwriteConfig: boolean
  configPath: string
  templateOptions: ConfigTemplateOptions
  templateVariables: ConfigTemplateVariables
}) => {
  await writeGeneratedFile({
    exists: hasConfig,
    overwrite: overwriteConfig,
    path: configPath,
    content: config(framework, templateVariables, templateOptions),
  })
  if (!hasConfig) {
    await writeGitignore(baseDir)
  }
}

const addAuthFile = async ({
  templateVariables,
  authPath,
  hasAuth,
  nextAuthProvider,
  overwriteAuth,
}: {
  templateVariables: AuthTemplateVariables
  authPath: string
  hasAuth: boolean
  nextAuthProvider: string
  overwriteAuth: boolean
}) => {
  await writeGeneratedFile({
    exists: hasAuth,
    overwrite: overwriteAuth,
    path: authPath,
    content: auth(nextAuthProvider, templateVariables),
  })
}

// Adds tina/template.{ts,js} file
export const addTemplateFile = async ({
  hasTemplates,
  templatesPath,
  overwriteTemplates,
  content,
}: {
  hasTemplates: boolean
  templatesPath: string
  overwriteTemplates: boolean
  content: string
}) => {
  await writeGeneratedFile({
    exists: hasTemplates,
    overwrite: overwriteTemplates,
    path: templatesPath,
    content,
  })
}

const addContentFile = async ({
  hasSampleContent,
  overwriteSampleContent,
  sampleContentPath,
}: {
  hasSampleContent: boolean
  overwriteSampleContent: boolean
  sampleContentPath: string
}) => {
  await writeGeneratedFile({
    exists: hasSampleContent,
    overwrite: overwriteSampleContent,
    path: sampleContentPath,
    content: helloWorldPost,
  })
}

const logNextSteps = ({
  framework,
  packageManager,
}: {
  packageManager: string
  framework: Framework
}) => {
  logger.info(focusText(`\n${titleText(' TinaCMS ')} has been initialized!`))
  logger.info(
    'To get started run: ' +
      cmdText(frameworkDevCmds[framework.name]({ packageManager }))
  )
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

const config = (
  framework: Framework,
  vars: ConfigTemplateVariables,
  opts: ConfigTemplateOptions
) => {
  return format(configExamples[framework.name](vars, opts), {
    parser: 'babel',
  })
}

const auth = (authType: string, vars: AuthTemplateVariables) => {
  return format(AuthTemplates[authType](vars), {
    parser: 'babel',
  })
}

const addReactiveFile = {
  next: ({
    baseDir,
    usingSrc,
    usingTypescript,
  }: {
    baseDir: string
    usingSrc: boolean
    usingTypescript: boolean
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
      fs.writeFileSync(tinaBlogPagePathFile, nextPostPage({ usingSrc }))
    }
    logger.info('Adding a nextjs example... ✅')

    // 4. update the users package.json
    const pack = JSON.parse(fs.readFileSync(packageJSONPath).toString())
    const oldScripts = pack.scripts || {}
    const newPack = JSON.stringify(
      {
        ...pack,
        scripts: extendNextScripts(oldScripts),
      },
      null,
      2
    )
    fs.writeFileSync(packageJSONPath, newPack)
  },
}

const addVercelKVCredentialsProviderFiles = async ({
  usingTypescript,
  generatedSignin,
  generatedRegister,
}: {
  usingTypescript: boolean
  generatedSignin: GeneratedFile
  generatedRegister: GeneratedFile
}) => {
  // TODO write generated files using writeGeneratedFile function
  // TODO consider protecting pages/api/gql.ts
  // TODO generate database.ts
  // TODO add api for register.ts
  // TODO add next auth endpoint
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
