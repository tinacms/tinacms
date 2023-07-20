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
import { nextPostPage } from './setup-files'
import { extendNextScripts } from '../../utils/script-helpers'
import { configExamples } from './setup-files/config'
import { generateCollections } from '../forestry-migrate'
import { writeGitignore } from '../../next/commands/codemod-command'
import { addVariablesToCode } from '../forestry-migrate/util/codeTransformer'
import detectEnvironment from './environment'
import promptForInitConfiguration, { Framework } from './config'

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

  const env = await detectEnvironment({
    pathToForestryConfig,
    rootPath,
  })
  const config = await promptForInitConfiguration(env, { showSelfHosted })

  let collections: string | null | undefined
  let templateCode: string | null | undefined
  let extraText: string | null | undefined

  let isForestryMigration = false
  if (env.hasForestryConfig) {
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
    hasForestryConfig: env.hasForestryConfig,
    noTelemetry: noTelemetry,
  })

  // Check for package.json
  const hasPackageJSON = await fs.pathExistsSync('package.json')
  // if no package.json, init
  if (!hasPackageJSON) {
    await createPackageJSON()
  }

  // Check if .gitignore exists
  const hasGitignore = await fs.pathExistsSync('.gitignore')
  // if no .gitignore, create one
  if (!hasGitignore) {
    await createGitignore({ baseDir: '' })
  } else {
    const hasNodeModulesIgnored = await checkGitignoreForNodeModules({
      baseDir: '',
    })
    if (!hasNodeModulesIgnored) {
      await addNodeModulesToGitignore({ baseDir: '' })
    }
  }

  await addDependencies(config.packageManager)

  if (isForestryMigration) {
    await addTemplateFile({
      templatesPath: config.typescript
        ? env.tsTemplatesPath
        : env.jsTemplatesPath,
      overwriteTemplates: config.typescript
        ? config.overwriteTemplatesTS
        : config.overwriteTemplatesJS,
      hasTemplates: config.typescript
        ? env.hasTypescriptTemplates
        : env.hasJavascriptTemplates,
      templateCode,
    })
  }

  // add tina/config.{js,ts}]
  await addConfigFile({
    // remove process fom pathToForestryConfig and add publicFolder
    publicFolder: path.join(
      path.relative(process.cwd(), pathToForestryConfig),
      config.publicFolder
    ),
    baseDir: '',
    framework: config.framework,
    collections,
    isForestryMigration,
    extraText,
    hasConfig: config.typescript
      ? env.hasTypescriptConfig
      : env.hasJavascriptConfig,
    overwriteConfig: config.typescript
      ? config.overwriteConfigTS
      : config.overwriteConfigJS,
    configPath: config.typescript ? env.tsConfigPath : env.jsConfigPath,
  })

  if (!env.hasForestryConfig) {
    // add /content/posts/hello-world.md
    await addContentFile({
      hasSampleContent: env.hasSampleContent,
      overwriteSampleContent: config.overwriteSampleContent,
      sampleContentPath: env.sampleContentPath,
    })
  }

  if (config.framework.reactive) {
    await addReactiveFile[config.framework.name]({
      baseDir: '',
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

const checkGitignoreForNodeModules = async ({
  baseDir,
}: {
  baseDir: string
}) => {
  const gitignoreContent = await fs
    .readFileSync(path.join(baseDir, '.gitignore'))
    .toString()
  return gitignoreContent.split('\n').some((item) => item === 'node_modules')
}
const addNodeModulesToGitignore = async ({ baseDir }: { baseDir: string }) => {
  logger.info(logText('Adding node_modules to .gitignore'))
  const gitignoreContent = await fs
    .readFileSync(path.join(baseDir, '.gitignore'))
    .toString()
  const newGitignoreContent = [
    ...gitignoreContent.split('\n'),
    'node_modules',
  ].join('\n')
  await fs.writeFileSync(path.join(baseDir, '.gitignore'), newGitignoreContent)
}
const addDependencies = async (packageManager) => {
  logger.info(logText('Adding dependencies, this might take a moment...'))
  const deps = ['tinacms', '@tinacms/cli']
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

export interface AddConfigArgs {
  extraText?: string
  publicFolder: string
  baseDir: string
  framework: Framework
  collections?: string
  isForestryMigration?: boolean
  token?: string
  clientId?: string
  hasConfig: boolean
  overwriteConfig: boolean
  configPath: string
}

const addConfigFile = async (args: AddConfigArgs) => {
  const { baseDir, hasConfig, overwriteConfig, configPath } = args
  if (hasConfig) {
    if (overwriteConfig) {
      logger.info(logText(`Overriding file at ${configPath}.`))
      await fs.outputFileSync(configPath, config(args))
    } else {
      logger.info(logText(`Not overriding file at ${configPath}.`))
    }
  } else {
    logger.info(logText(`Adding config file at ${configPath}`))
    await fs.outputFileSync(configPath, config(args))
    await writeGitignore(baseDir)
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
      await fs.outputFileSync(sampleContentPath, content)
    } else {
      logger.info(logText(`Not overriding file at ${sampleContentPath}.`))
    }
  } else {
    logger.info(logText(`Adding content file at ${sampleContentPath}`))
    await fs.outputFileSync(sampleContentPath, content)
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
  const installText = `${packageManagers[packageManager]} tinacms dev -c "<your dev command>"`
  return installText
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

const config = (args: AddConfigArgs) => {
  return format(configExamples[args.framework.name](args), { parser: 'babel' })
}

const content = `---
title: Hello, World!
---

## Hello World!

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non lorem diam. Quisque vulputate nibh sodales eros pretium tincidunt. Aenean porttitor efficitur convallis. Nulla sagittis finibus convallis. Phasellus in fermentum quam, eu egestas tortor. Maecenas ac mollis leo. Integer maximus eu nisl vel sagittis.

Suspendisse facilisis, mi ac scelerisque interdum, ligula ex imperdiet felis, a posuere eros justo nec sem. Nullam laoreet accumsan metus, sit amet tincidunt orci egestas nec. Pellentesque ut aliquet ante, at tristique nunc. Donec non massa nibh. Ut posuere lacus non aliquam laoreet. Fusce pharetra ligula a felis porttitor, at mollis ipsum maximus. Donec quam tortor, vehicula a magna sit amet, tincidunt dictum enim. In hac habitasse platea dictumst. Mauris sit amet ornare ligula, blandit consequat risus. Duis malesuada pellentesque lectus, non feugiat turpis eleifend a. Nullam tempus ante et diam pretium, ac faucibus ligula interdum.
`
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
