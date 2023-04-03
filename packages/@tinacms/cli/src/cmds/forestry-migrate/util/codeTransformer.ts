import path from 'path'
import fs from 'fs-extra'
import { TinaField } from '@tinacms/schema-tools'
import { format } from 'prettier'
import { stringifyLabelWithField } from '..'

/**
 * This function is used to replace the internal code with the actual code
 *
 * EX:
 *  __TINA_INTERNAL__:::...fields::: => ...fields
 *
 * or __TINA_INTERNAL__:::fields::: => fields
 */
export const addVariablesToCode = (codeWithTinaPrefix: string) => {
  const code = codeWithTinaPrefix.replace(
    /"__TINA_INTERNAL__:::(.*?):::"/g,
    '$1'
  )
  return { code }
}

export const makeFieldsWithInternalCode = ({
  hasBody,
  field,
  bodyField,
}:
  | {
      hasBody: true
      field: string
      bodyField: unknown
    }
  | {
      hasBody: false
      field: string
      bodyField?: never
    }
  | {
      hasBody: boolean
      field: string
      bodyField: unknown
    }) => {
  if (hasBody) {
    return [bodyField, `__TINA_INTERNAL__:::...${field}:::`]
  } else {
    return `__TINA_INTERNAL__:::${field}:::`
  }
}

export const makeTemplateFile = async ({
  templateMap,
  rootPath,
  usingTypescript,
}: {
  templateMap: Map<
    string,
    {
      fields: TinaField[]
      templateObj: any
    }
  >
  rootPath: string
  usingTypescript: boolean
}) => {
  const templateFilePath = path.join(rootPath, 'tina', 'templates.ts')
  const importStatements: string[] = []
  const templateCodeText: string[] = []

  for (const template of templateMap.values()) {
    importStatements.push(
      `import { ${stringifyLabelWithField(
        template.templateObj.label
      )} } from './templates'`
    )

    templateCodeText.push(
      `export const ${stringifyLabelWithField(template.templateObj.label)} ${
        usingTypescript ? ': TinaField[]' : ''
      } = ${addVariablesToCode(JSON.stringify(template.fields, null, 2)).code}`
    )
  }
  const templateCode = `
${usingTypescript ? "import type { TinaField } from 'tinacms'" : ''}
${templateCodeText.join('\n')}
  `

  const formattedCode = format(templateCode)

  await fs.writeFile(templateFilePath, formattedCode)

  return { importStatements }
}
