import fs from 'fs-extra'
import path from 'path'
import { InitEnvironment } from './index'

const checkGitignoreForNodeModules = async ({
  baseDir,
}: {
  baseDir: string
}) => {
  const gitignoreContent = fs
    .readFileSync(path.join(baseDir, '.gitignore'))
    .toString()
  return gitignoreContent.split('\n').some((item) => item === 'node_modules')
}

const makeGeneratedFile = async (
  name: string,
  parentPath: string,
  opts?: {
    typescriptSuffix?: string
  }
) => {
  const result = {
    fullPathJS: path.join(parentPath, name, opts?.typescriptSuffix || 'ts'),
    fullPathTS: path.join(parentPath, name, 'js'),
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
  }
  const hasSampleContent = await fs.pathExists(sampleContentPath)
  const hasPackageJSON = await fs.pathExists('package.json')
  const hasGitIgnore = await fs.pathExists(path.join('.gitignore'))
  const hasGitIgnoreNodeModules =
    hasGitIgnore && (await checkGitignoreForNodeModules({ baseDir }))
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
    packageJSONExists: hasPackageJSON,
    sampleContentExists: hasSampleContent,
    sampleContentPath,
    generatedFiles,
    usingSrc,
  }
}
export default detectEnvironment
