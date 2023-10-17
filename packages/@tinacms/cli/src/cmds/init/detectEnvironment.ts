import fs from 'fs-extra'
import path from 'path'
import { logger } from '../../logger'
import { InitEnvironment } from './index'

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
  tinaVersion?: string
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
  const usingSrc =
    fs.pathExistsSync(path.join(baseDir, 'src')) &&
    (fs.pathExistsSync(path.join(baseDir, 'src', 'app')) ||
      fs.pathExistsSync(path.join(baseDir, 'src', 'pages')))
  const hasAppDir = usingSrc
    ? fs.pathExistsSync(path.join(baseDir, 'src', 'app'))
    : fs.pathExistsSync(path.join(baseDir, 'app'))

  const tinaFolder = path.join(baseDir, 'tina')
  const tinaConfigExists = Boolean(
    // Does the tina folder exist?
    (await fs.pathExists(tinaFolder)) &&
      // Does the tina folder contain a config file?
      (await fs.readdir(tinaFolder)).find((x) => x.includes('config'))
  )

  // The path to the pages directory. If using src, it will be <baseDir>/src/pages
  const pagesDir = [baseDir, usingSrc ? 'src' : false, 'pages'].filter(
    Boolean
  ) as string[]

  const generatedFiles: InitEnvironment['generatedFiles'] = {
    config: await makeGeneratedFile('config', tinaFolder),
    database: await makeGeneratedFile('database', tinaFolder),
    templates: await makeGeneratedFile('templates', tinaFolder),
    'next-api-handler': await makeGeneratedFile(
      '[...routes]',
      path.join(...pagesDir, 'api', 'tina')
    ),
    'tina.svg': await makeGeneratedFile('tina', path.join(baseDir, 'public'), {
      extensionOverride: 'svg',
    }),
    'reactive-example': await makeGeneratedFile(
      '[filename]',
      path.join(...pagesDir, 'demo', 'blog'),
      {
        typescriptSuffix: 'tsx',
      }
    ),
  }

  const hasSampleContent = await fs.pathExists(sampleContentPath)
  const hasPackageJSON = await fs.pathExists('package.json')
  let hasTinaDeps = false

  if (hasPackageJSON) {
    try {
      const packageJSON = await fs.readJSON('package.json')
      const deps: string[] = []
      if (packageJSON?.dependencies) {
        deps.push(...Object.keys(packageJSON.dependencies))
      }
      if (packageJSON?.devDependencies) {
        deps.push(...Object.keys(packageJSON.devDependencies))
      }
      if (deps.includes('@tinacms/cli') && deps.includes('tinacms')) {
        hasTinaDeps = true
      }
    } catch (e) {
      logger.error(
        'Error reading package.json assuming that no Tina dependencies are installed'
      )
    }
  }

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
    forestryConfigExists: hasForestryConfig,
    frontMatterFormat,
    gitIgnoreExists: hasGitIgnore,
    gitIgnoreNodeModulesExists: hasGitIgnoreNodeModules,
    gitIgnoreEnvExists: hasGitIgnoreEnv,
    gitIgnoreTinaEnvExists: hasEnvTina,
    nextAppDir: hasAppDir,
    packageJSONExists: hasPackageJSON,
    sampleContentExists: hasSampleContent,
    sampleContentPath,
    generatedFiles,
    usingSrc,
    tinaConfigExists,
    hasTinaDeps,
  }
  if (debug) {
    console.log('Environment:')
    console.log(JSON.stringify(env, null, 2))
  }
  return env
}
export default detectEnvironment
