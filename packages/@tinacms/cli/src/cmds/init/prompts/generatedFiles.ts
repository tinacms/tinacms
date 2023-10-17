import prompts from 'prompts'
import type { GeneratedFile } from '..'
import type { Config } from './types'

// conditionally generate overwrite prompts for generated ts/js
const askIfOverride = async ({
  generatedFile,
  usingTypescript,
}: {
  usingTypescript: boolean
  generatedFile: GeneratedFile
}) => {
  if (usingTypescript) {
    const result = await prompts({
      name: `override`,
      type: 'confirm',
      message: `Found existing file at ${generatedFile.fullPathTS}. Would you like to overwrite?`,
    })
    return Boolean(result.override)
  } else {
    const result = await prompts({
      name: `override`,
      type: 'confirm',
      message: `Found existing file at ${generatedFile.fullPathJS}. Would you like to overwrite?`,
    })
    return Boolean(result.override)
  }
}

export const askOverwriteGenerateFiles = async ({
  config,
  generatedFiles,
}: {
  generatedFiles: GeneratedFile[]
  config: Config
}) => {
  const overwriteList: string[] = []
  for (let i = 0; i < generatedFiles.length; i++) {
    const generatedFile = generatedFiles[i]

    if ((await generatedFile.resolve(config.typescript)).exists) {
      // if the file exists, ask if we should overwrite
      const overwrite = await askIfOverride({
        generatedFile,
        usingTypescript: config.typescript,
      })
      if (overwrite) {
        overwriteList.push(generatedFile.name)
      }
    }
  }
  return overwriteList
}
