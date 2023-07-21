import path from 'path'
import { generateCollections } from '../forestry-migrate'
import { addVariablesToCode } from '../forestry-migrate/util/codeTransformer'
import { logger } from '../../logger'
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
import {
  configExamples,
  ConfigTemplateOptions,
  ConfigTemplateVariables,
} from './templates/config'
import { writeGitignore } from '../../next/commands/codemod-command'
import {
  templates as AuthTemplates,
  Variables as AuthTemplateVariables,
} from './templates/auth'
import { helloWorldPost } from './templates/content'
import { format } from 'prettier'
import {
  authRegisterApiHandler,
  authRegisterPage,
  authSigninPage,
  nextAuthApiHandler,
  nextPostPage,
} from './templates/next'
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
      generatedFile: env.generatedFiles['templates'],
      content: templateCode,
      config,
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
    generatedFile: env.generatedFiles['config'],
    config,
  })

  if (config.nextAuthProvider) {
    await addAuthFile({
      config,
      generatedFile: env.generatedFiles['auth'],
    })

    await addNextAuthApiHandler({
      config,
      generatedFile: env.generatedFiles['next-auth-api-handler'],
      content: nextAuthApiHandler(),
    })

    if (config.nextAuthProvider === 'vercel-kv-credentials-provider') {
      await addVercelKVCredentialsProviderFiles({
        generatedSignin:
          env.generatedFiles['vercel-kv-credentials-provider-signin'],
        generatedRegister:
          env.generatedFiles['vercel-kv-credentials-provider-register'],
        generatedRegisterApiHandler:
          env.generatedFiles[
            'vercel-kv-credentials-provider-register-api-handler'
          ],
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
  const { exists, path } = generatedFile.resolve(typescript)
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
        })
      },
    },
    overwrite: config.overwriteSampleContent,
    content: helloWorldPost,
    typescript: false,
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
  generatedRegisterApiHandler,
  config,
}: {
  generatedSignin: GeneratedFile
  generatedRegister: GeneratedFile
  generatedRegisterApiHandler: GeneratedFile
  config: Record<any, any>
}) => {
  await writeGeneratedFile({
    generatedFile: generatedSignin,
    overwrite: config.typescript
      ? config.overwriteVercelKVCredentialsProviderSigninJS
      : config.overwriteVercelKVCredentialsProviderSigninJS,
    content: authSigninPage(),
    typescript: config.typescript,
  })
  await writeGeneratedFile({
    generatedFile: generatedRegister,
    overwrite: config.typescript
      ? config.overwriteVercelKVCredentialsProviderRegisterJS
      : config.overwriteVercelKVCredentialsProviderRegisterJS,
    content: authRegisterPage({
      nextAuthCredentialsProviderName: config.nextAuthCredentialsProviderName,
    }),
    typescript: config.typescript,
  })
  await writeGeneratedFile({
    generatedFile: generatedRegisterApiHandler,
    overwrite: config.typescript
      ? config.overwriteVercelKVCredentialsProviderRegisterApiHandlerTS
      : config.overwriteVercelKVCredentialsProviderRegisterApiHandlerJS,
    content: authRegisterApiHandler(),
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
