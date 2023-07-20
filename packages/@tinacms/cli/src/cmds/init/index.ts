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
  Variables as AuthTemplateVariables,
  templates as AuthTemplates,
} from './templates/auth'
import { generateCollections } from '../forestry-migrate'
import { writeGitignore } from '../../next/commands/codemod-command'
import { addVariablesToCode } from '../forestry-migrate/util/codeTransformer'
import detectEnvironment from './environment'
import promptForInitConfiguration, { Framework } from './config'
import { helloWorldPost } from './templates/content'

export async function initStaticTina({
  rootPath,
  pathToForestryConfig,
  noTelemetry,
  showSelfHosted = false,
}: {
  rootPath: string
  pathToForestryConfig: string
  noTelemetry: boolean
  showSelfHosted?: boolean
}) {
  logger.level = 'info'

  process.chdir(rootPath)

  const baseDir = ''

  const env = await detectEnvironment({
    baseDir,
    pathToForestryConfig,
    rootPath,
  })
  const config = await promptForInitConfiguration(env, { showSelfHosted })

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
    await addTemplateFile({
      templatesPath: config.typescript
        ? env.typescriptTemplatesPath
        : env.javascriptTemplatesPath,
      overwriteTemplates: config.typescript
        ? config.overwriteTemplatesTS
        : config.overwriteTemplatesJS,
      hasTemplates: config.typescript
        ? env.typescriptTemplatesExists
        : env.javascriptTemplatesExists,
      templateCode,
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
      selfHosted: config.selfHosted,
    },
    baseDir,
    framework: config.framework,
    hasConfig: config.typescript
      ? env.typescriptConfigExists
      : env.javascriptConfigExists,
    overwriteConfig: config.typescript
      ? config.overwriteConfigTS
      : config.overwriteConfigJS,
    configPath: config.typescript
      ? env.typescriptConfigPath
      : env.javascriptConfigPath,
  })

  if (config.nextAuthProvider) {
    await addAuthFile({
      templateVariables: {
        nextAuthCredentialsProviderName: config.nextAuthCredentialsProviderName,
      },
      authPath: config.typescript
        ? env.typescriptAuthPath
        : env.javascriptAuthPath,
      hasAuth: config.typescript
        ? env.typescriptAuthExists
        : env.javascriptAuthExists,
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
    deps.push('next-auth-tinacms')
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
  if (hasConfig) {
    if (overwriteConfig) {
      logger.info(logText(`Overriding file at ${configPath}.`))
      await fs.outputFileSync(
        configPath,
        config(framework, templateVariables, templateOptions)
      )
    } else {
      logger.info(logText(`Not overriding file at ${configPath}.`))
    }
  } else {
    logger.info(logText(`Adding config file at ${configPath}`))
    await fs.outputFileSync(
      configPath,
      config(framework, templateVariables, templateOptions)
    )
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
  if (hasAuth) {
    if (overwriteAuth) {
      logger.info(logText(`Overriding file at ${authPath}.`))
      await fs.outputFileSync(
        authPath,
        auth(nextAuthProvider, templateVariables)
      )
    } else {
      logger.info(logText(`Not overriding file at ${authPath}.`))
    }
  } else {
    logger.info(logText(`Adding config file at ${authPath}`))
    await fs.outputFileSync(authPath, auth(nextAuthProvider, templateVariables))
  }
}

// Adds tina/template.{ts,js} file
export const addTemplateFile = async ({
  hasTemplates,
  templatesPath,
  overwriteTemplates,
  templateCode,
}: {
  hasTemplates: boolean
  templatesPath: string
  overwriteTemplates: boolean
  templateCode: string
}) => {
  if (hasTemplates) {
    if (overwriteTemplates) {
      logger.info(logText(`Overwriting file at ${templatesPath}.`))
      await fs.outputFileSync(templatesPath, templateCode)
    } else {
      logger.info(logText(`Not overwriting file at ${templatesPath}.`))
    }
  } else {
    logger.info(logText(`Adding template file at ${templatesPath}`))
    await fs.outputFileSync(templatesPath, templateCode)
  }
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
  if (hasSampleContent) {
    if (overwriteSampleContent) {
      logger.info(logText(`Overriding file at ${sampleContentPath}.`))
      await fs.outputFileSync(sampleContentPath, helloWorldPost)
    } else {
      logger.info(logText(`Not overriding file at ${sampleContentPath}.`))
    }
  } else {
    logger.info(logText(`Adding content file at ${sampleContentPath}`))
    await fs.outputFileSync(sampleContentPath, helloWorldPost)
  }
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
    const installText = `${packageManagers[packageManager]} dev`
    return installText
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
    usingTypescript,
  }: {
    baseDir: string
    usingTypescript: boolean
  }) => {
    const usingSrc = !fs.pathExistsSync(path.join(baseDir, 'pages'))
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
