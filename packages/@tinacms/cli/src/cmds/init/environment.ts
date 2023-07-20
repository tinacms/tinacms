import fs from 'fs-extra'
import path from 'path'

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
  const hasTypescriptTemplates = fs.pathExistsSync(tsTemplatesPath)
  const hasJavascriptTemplates = fs.pathExistsSync(jsTemplatesPath)
  const tsConfigPath = path.join(baseDir, 'tina', `config.ts`)
  const jsConfigPath = path.join(baseDir, 'tina', `config.js`)
  const hasTypescriptConfig = fs.pathExistsSync(tsConfigPath)
  const hasJavascriptConfig = fs.pathExistsSync(jsConfigPath)
  let frontMatterFormat
  if (hasForestryConfig) {
    const hugoConfigPath = path.join(rootPath, 'config.toml')
    if (fs.pathExistsSync(hugoConfigPath)) {
      const hugoConfig = await fs.readFile(hugoConfigPath, 'utf8')
      frontMatterFormat = hugoConfig.match(/metaDataFormat = "(.*)"/)
    }
  }
  return {
    frontMatterFormat,
    hasForestryConfig,
    hasJavascriptConfig,
    hasJavascriptTemplates,
    hasSampleContent,
    hasTypescriptConfig,
    hasTypescriptTemplates,
    jsConfigPath,
    jsTemplatesPath,
    sampleContentPath,
    tsConfigPath,
    tsTemplatesPath,
  }
}
export default detectEnvironment

export type InitEnvironment = {
  frontMatterFormat: 'yaml' | 'toml' | 'json'
  hasForestryConfig: boolean
  hasJavascriptConfig: boolean
  hasJavascriptTemplates: boolean
  hasSampleContent: boolean
  hasTypescriptConfig: boolean
  hasTypescriptTemplates: boolean
  jsConfigPath: string
  jsTemplatesPath: string
  sampleContentPath: string
  tsConfigPath: string
  tsTemplatesPath: string
}
