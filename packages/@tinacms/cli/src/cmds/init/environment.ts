import fs from 'fs-extra'
import path from 'path'

export type InitEnvironment = {
  forestryConfigExists: boolean
  frontMatterFormat: 'yaml' | 'toml' | 'json'
  gitIgnoreExists: boolean
  gitIgoreNodeModulesExists: boolean
  javascriptConfigExists: boolean
  javascriptConfigPath: string
  javascriptTemplatesExists: boolean
  javascriptTemplatesPath: string
  packageJSONExists: boolean
  sampleContentExists: boolean
  sampleContentPath: string
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
  const jsTemplatesPath = path.join(baseDir, 'tina', 'templates.js')
  const tsTemplatesPath = path.join(baseDir, 'tina', 'templates.ts')
  const hasSampleContent = await fs.pathExists(sampleContentPath)
  const hasTypescriptTemplates = await fs.pathExists(tsTemplatesPath)
  const hasJavascriptTemplates = await fs.pathExists(jsTemplatesPath)
  const tsConfigPath = path.join(baseDir, 'tina', `config.ts`)
  const jsConfigPath = path.join(baseDir, 'tina', `config.js`)
  const hasTypescriptConfig = await fs.pathExists(tsConfigPath)
  const hasJavascriptConfig = await fs.pathExists(jsConfigPath)
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
    javascriptConfigExists: hasJavascriptConfig,
    javascriptConfigPath: jsConfigPath,
    javascriptTemplatesExists: hasJavascriptTemplates,
    javascriptTemplatesPath: jsTemplatesPath,
    packageJSONExists: hasPackageJSON,
    sampleContentExists: hasSampleContent,
    sampleContentPath,
    typescriptConfigExists: hasTypescriptConfig,
    typescriptConfigPath: tsConfigPath,
    typescriptTemplatesExists: hasTypescriptTemplates,
    typescriptTemplatesPath: tsTemplatesPath,
  }
}
export default detectEnvironment
