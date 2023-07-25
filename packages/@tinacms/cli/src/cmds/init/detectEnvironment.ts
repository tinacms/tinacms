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

async function detectNextGlobalStyles(baseDir: string, usingSrc: boolean) {
  let pathToGlobalStyles = ''
  let globalStylesHasTailwind = false
  let pathToApp = path.join(baseDir, usingSrc ? 'src' : 'pages', '_app')
  if (fs.pathExistsSync(`${pathToApp}.js`)) {
    pathToApp = `${pathToApp}.js`
  } else if (fs.pathExistsSync(`${pathToApp}.tsx`)) {
    pathToApp = `${pathToApp}.tsx`
  } else {
    pathToApp = ''
  }
  if (pathToApp) {
    console.log('pathToApp', pathToApp)
    // read lines from file into array of strings
    const lines = (await fs.readFile(pathToApp, 'utf8')).split('\n')
    let stylesPath = ''
    for (const line of lines) {
      const match = line.match(/^import\s+["'](.*\.css)["'];?$/)
      if (match) {
        stylesPath = match[1]
        break
      }
    }
    if (stylesPath) {
      if (stylesPath.startsWith('@')) {
        stylesPath = stylesPath.replace('@', baseDir)
      } else {
        stylesPath = path.join(path.dirname(pathToApp), stylesPath)
      }
      console.log('stylesPath', stylesPath)
      pathToGlobalStyles = stylesPath

      // compute path to styles file
      if (fs.pathExistsSync(stylesPath)) {
        // check if styles file imports tailwind
        const globalStylesContent = await fs.readFile(
          pathToGlobalStyles,
          'utf8'
        )
        if (globalStylesContent.indexOf('@tailwind') !== -1) {
          globalStylesHasTailwind = true
        }
      }
    }
  }
  return { pathToGlobalStyles, globalStylesHasTailwind }
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
  const hasTailwindConfig = await fs.pathExists(
    path.join(baseDir, 'tailwind.config.js')
  )
  const sampleContentPath = path.join(
    baseDir,
    'content',
    'posts',
    'hello-world.md'
  )
  const usingSrc = !fs.pathExistsSync(path.join(baseDir, 'pages'))
  const { pathToGlobalStyles, globalStylesHasTailwind } =
    await detectNextGlobalStyles(baseDir, usingSrc)

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
    ['tailwind-config']: await makeGeneratedFile(
      'tailwind.config',
      path.join(baseDir),
      {
        typescriptSuffix: 'js',
      }
    ),
    ['postcss-config']: await makeGeneratedFile(
      'postcss.config',
      path.join(baseDir),
      {
        typescriptSuffix: 'js',
      }
    ),
    ['tina.svg']: await makeGeneratedFile(
      'tina',
      path.join(baseDir, 'public'),
      {
        extensionOverride: 'svg',
      }
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
  const env = {
    forestryConfigExists: hasForestryConfig,
    frontMatterFormat,
    gitIgnoreExists: hasGitIgnore,
    gitIgoreNodeModulesExists: hasGitIgnoreNodeModules,
    gitIgnoreTinaEnvExists: hasEnvTina,
    globalStylesHasTailwind,
    globalStylesPath: pathToGlobalStyles,
    tailwindConfigExists: hasTailwindConfig,
    packageJSONExists: hasPackageJSON,
    sampleContentExists: hasSampleContent,
    sampleContentPath,
    generatedFiles,
    usingSrc,
  }
  if (debug) {
    console.log('Environment:')
    console.log(JSON.stringify(env, null, 2))
  }
  return env
}
export default detectEnvironment
