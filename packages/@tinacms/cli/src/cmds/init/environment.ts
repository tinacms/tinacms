import fs from 'fs-extra'
import path from 'path'

export type InitEnvironment = {
  forestryConfigExists: boolean
  frontMatterFormat: 'yaml' | 'toml' | 'json'
  gitIgnoreExists: boolean
  gitIgoreNodeModulesExists: boolean
  javascriptAuthPath: string
  javascriptAuthExists: boolean
  javascriptConfigExists: boolean
  javascriptConfigPath: string
  javascriptTemplatesExists: boolean
  javascriptTemplatesPath: string
  packageJSONExists: boolean
  sampleContentExists: boolean
  sampleContentPath: string
  typescriptAuthPath: string
  typescriptAuthExists: boolean
  typescriptConfigExists: boolean
  typescriptConfigPath: string
  typescriptTemplatesExists: boolean
  typescriptTemplatesPath: string
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
  const javascriptAuthPath = path.join(baseDir, 'tina', 'auth.js')
  const hasJavascriptAuth = await fs.pathExists(javascriptAuthPath)
  const typescriptAuthPath = path.join(baseDir, 'tina', 'auth.ts')
  const hasTypescriptAuth = await fs.pathExists(typescriptAuthPath)
  const javascriptTemplatesPath = path.join(baseDir, 'tina', 'templates.js')
  const typescriptTemplatesPath = path.join(baseDir, 'tina', 'templates.ts')
  const hasSampleContent = await fs.pathExists(sampleContentPath)
  const hasTypescriptTemplates = await fs.pathExists(typescriptTemplatesPath)
  const hasJavascriptTemplates = await fs.pathExists(javascriptTemplatesPath)
  const typescriptConfigPath = path.join(baseDir, 'tina', `config.ts`)
  const javascriptConfigPath = path.join(baseDir, 'tina', `config.js`)
  const hasTypescriptConfig = await fs.pathExists(typescriptConfigPath)
  const hasJavascriptConfig = await fs.pathExists(javascriptConfigPath)
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
    javascriptAuthExists: hasJavascriptAuth,
    javascriptAuthPath,
    javascriptConfigExists: hasJavascriptConfig,
    javascriptConfigPath,
    javascriptTemplatesExists: hasJavascriptTemplates,
    javascriptTemplatesPath: javascriptTemplatesPath,
    packageJSONExists: hasPackageJSON,
    sampleContentExists: hasSampleContent,
    sampleContentPath,
    typescriptAuthExists: hasTypescriptAuth,
    typescriptAuthPath,
    typescriptConfigExists: hasTypescriptConfig,
    typescriptConfigPath,
    typescriptTemplatesExists: hasTypescriptTemplates,
    typescriptTemplatesPath,
  }
}
export default detectEnvironment
