import fs from 'fs-extra'
import path from 'path'
import { InitEnvironment } from './index'
import dotenv from 'dotenv'

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
  }
) => {
  const result = {
    fullPathTS: path.join(
      parentPath,
      `${name}.${opts?.typescriptSuffix || 'ts'}`
    ),
    fullPathJS: path.join(parentPath, `${name}.js`),
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
}: {
  baseDir?: string
  pathToForestryConfig: string
  rootPath: string
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
  const usingSrc = !fs.pathExistsSync(path.join(baseDir, 'pages'))
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
  }
  const hasSampleContent = await fs.pathExists(sampleContentPath)
  const hasPackageJSON = await fs.pathExists('package.json')
  const hasGitIgnore = await fs.pathExists(path.join('.gitignore'))
  const hasGitIgnoreNodeModules =
    hasGitIgnore &&
    (await checkGitignoreForItem({ baseDir, line: 'node_modules' }))
  const hasEnvTina =
    hasGitIgnore &&
    (await checkGitignoreForItem({ baseDir, line: '.env.tina' }))
  let frontMatterFormat
  if (hasForestryConfig) {
    const hugoConfigPath = path.join(rootPath, 'config.toml')
    if (await fs.pathExists(hugoConfigPath)) {
      const hugoConfig = await fs.readFile(hugoConfigPath, 'utf8')
      frontMatterFormat = hugoConfig.match(/metaDataFormat = "(.*)"/)
    }
  }
  return {
    forestryConfigExists: hasForestryConfig,
    frontMatterFormat,
    gitIgnoreExists: hasGitIgnore,
    gitIgoreNodeModulesExists: hasGitIgnoreNodeModules,
    gitIgnoreTinaEnvExists: hasEnvTina,
    packageJSONExists: hasPackageJSON,
    sampleContentExists: hasSampleContent,
    sampleContentPath,
    generatedFiles,
    usingSrc,
  }
}
export default detectEnvironment