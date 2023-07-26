import fs from 'fs-extra'
import path from 'path'
import { InitEnvironment } from './index'
import dotenv from 'dotenv'
import { version } from '../../../package.json'

const checkGitignoreForItem = async ({
  baseDir,
  line,
}: {
  baseDir: string
  line: string
}) => {
  const gitignoreContent = fs
    .readFileSync(path.join(baseDir, '.gitignore'))
    .toString()
  return gitignoreContent.split('\n').some((item) => item === line)
}

const makeGeneratedFile = async (
  name: string,
  parentPath: string,
  opts?: {
    typescriptSuffix?: string
    extensionOverride?: string
  }
) => {
  const result = {
    fullPathTS: path.join(
      parentPath,
      `${name}.${opts?.typescriptSuffix || opts?.extensionOverride || 'ts'}`
    ),
    fullPathJS: path.join(
      parentPath,
      `${name}.${opts?.extensionOverride || 'js'}`
    ),
    name,
    parentPath,
    typescriptExists: false,
    javascriptExists: false,
    get resolve() {
      return (typescript) =>
        typescript
          ? {
              exists: this.typescriptExists,
              path: this.fullPathTS,
              parentPath: this.parentPath,
            }
          : {
              exists: this.javascriptExists,
              path: this.fullPathJS,
              parentPath: this.parentPath,
            }
    },
  }

  result.typescriptExists = await fs.pathExists(result.fullPathTS)
  result.javascriptExists = await fs.pathExists(result.fullPathJS)

  return result
}

const detectEnvironment = async ({
  baseDir = '',
  pathToForestryConfig,
  rootPath,
  debug = false,
}: {
  baseDir?: string
  pathToForestryConfig: string
  rootPath: string
  debug?: boolean
}): Promise<InitEnvironment> => {
  if (fs.pathExistsSync('.env.tina')) {
    dotenv.config({ path: '.env.tina' })
  }

  // If there is a forestry config, ask user to migrate it to tina collections
  const hasForestryConfig = await fs.pathExists(
    path.join(pathToForestryConfig, '.forestry', 'settings.yml')
  )
  const sampleContentPath = path.join(
    baseDir,
    'content',
    'posts',
    'hello-world.md'
  )
  const usingSrc =
    fs.pathExistsSync(path.join(baseDir, 'src')) &&
    (fs.pathExistsSync(path.join(baseDir, 'src', 'app')) ||
      fs.pathExistsSync(path.join(baseDir, 'src', 'pages')))
  const hasAppDir = usingSrc
    ? fs.pathExistsSync(path.join(baseDir, 'src', 'app'))
    : fs.pathExistsSync(path.join(baseDir, 'app'))

  const tinaFolder = path.join(baseDir, 'tina')
  const generatedFiles = {
    auth: await makeGeneratedFile('auth', tinaFolder),
    config: await makeGeneratedFile('config', tinaFolder),
    database: await makeGeneratedFile('database', tinaFolder),
    templates: await makeGeneratedFile('templates', tinaFolder),
    ['vercel-kv-credentials-provider-signin']: await makeGeneratedFile(
      'signin',
      path.join(baseDir, usingSrc ? 'src' : 'pages', 'auth'),
      {
        typescriptSuffix: 'tsx',
      }
    ),
    ['vercel-kv-credentials-provider-register']: await makeGeneratedFile(
      'register',
      path.join(baseDir, usingSrc ? 'src' : 'pages', 'auth'),
      {
        typescriptSuffix: 'tsx',
      }
    ),
    ['vercel-kv-credentials-provider-tailwindcss']: await makeGeneratedFile(
      'tw.modules',
      path.join(baseDir, usingSrc ? 'src' : 'pages', 'auth'),
      {
        extensionOverride: 'css',
      }
    ),
    ['next-auth-api-handler']: await makeGeneratedFile(
      '[...nextauth]',
      path.join(baseDir, usingSrc ? 'src' : 'pages', 'api', 'auth')
    ),
    ['vercel-kv-credentials-provider-register-api-handler']:
      await makeGeneratedFile(
        'register',
        path.join(baseDir, usingSrc ? 'src' : 'pages', 'api', 'credentials')
      ),
    ['gql-api-handler']: await makeGeneratedFile(
      'gql',
      path.join(baseDir, usingSrc ? 'src' : 'pages', 'api')
    ),
    ['tina.svg']: await makeGeneratedFile(
      'tina',
      path.join(baseDir, 'public'),
      {
        extensionOverride: 'svg',
      }
    ),
  }

  const cliVersion = version
  const tagVersion = version?.startsWith('0.0.0') ? version : ''
  const hasSampleContent = await fs.pathExists(sampleContentPath)
  const hasPackageJSON = await fs.pathExists('package.json')
  const hasGitIgnore = await fs.pathExists(path.join('.gitignore'))
  const hasGitIgnoreNodeModules =
    hasGitIgnore &&
    (await checkGitignoreForItem({ baseDir, line: 'node_modules' }))
  const hasEnvTina =
    hasGitIgnore &&
    (await checkGitignoreForItem({ baseDir, line: '.env.tina' }))
  const hasGitIgnoreEnv =
    hasGitIgnore && (await checkGitignoreForItem({ baseDir, line: '.env' }))
  let frontMatterFormat
  if (hasForestryConfig) {
    const hugoConfigPath = path.join(rootPath, 'config.toml')
    if (await fs.pathExists(hugoConfigPath)) {
      const hugoConfig = await fs.readFile(hugoConfigPath, 'utf8')
      frontMatterFormat = hugoConfig.match(/metaDataFormat = "(.*)"/)
    }
  }
  const env = {
    cliVersion,
    forestryConfigExists: hasForestryConfig,
    frontMatterFormat,
    gitIgnoreExists: hasGitIgnore,
    gitIgoreNodeModulesExists: hasGitIgnoreNodeModules,
    gitIgnoreEnvExists: hasGitIgnoreEnv,
    gitIgnoreTinaEnvExists: hasEnvTina,
    nextAppDir: hasAppDir,
    packageJSONExists: hasPackageJSON,
    sampleContentExists: hasSampleContent,
    sampleContentPath,
    generatedFiles,
    tagVersion,
    usingSrc,
  }
  if (debug) {
    console.log('Environment:')
    console.log(JSON.stringify(env, null, 2))
  }
  return env
}
export default detectEnvironment
