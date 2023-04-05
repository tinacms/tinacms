import path from 'path'
import fs from 'fs-extra'
import { TinaField } from '@tinacms/schema-tools'
import { format } from 'prettier'
import TsParser from 'prettier/parser-typescript'
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
  spread,
}:
  | {
      hasBody: true
      field: string
      spread?: never
      bodyField: unknown
    }
  | {
      hasBody: false
      field: string
      spread?: boolean
      bodyField?: never
    }
  | {
      hasBody: boolean
      field: string
      spread?: boolean
      bodyField: unknown
    }) => {
  if (hasBody) {
    return [bodyField, `__TINA_INTERNAL__:::...${field}():::`]
  } else {
    if (spread) return `__TINA_INTERNAL__:::...${field}():::`
    return `__TINA_INTERNAL__:::${field}():::`
  }
}

// Makes the template file text and the import statements for the config file
export const makeTemplateFile = async ({
  templateMap,
  usingTypescript,
}: {
  templateMap: Map<
    string,
    {
      fields: TinaField[]
      templateObj: any
    }
  >
  usingTypescript: boolean
}) => {
  const importStatements: string[] = []
  const templateCodeText: string[] = []

  for (const template of templateMap.values()) {
    importStatements.push(
      `import { ${stringifyLabelWithField(
        template.templateObj.label
      )} } from './templates'`
    )

    templateCodeText.push(
      `export function ${stringifyLabelWithField(
        template.templateObj.label
      )} (){
        return ${
          addVariablesToCode(JSON.stringify(template.fields, null, 2)).code
        } ${usingTypescript ? 'as TinaField[]' : ''} 
      } `
    )
  }
  const templateCode = `
${usingTypescript ? "import type { TinaField } from 'tinacms'" : ''}
${templateCodeText.join('\n')}
  `

  const formattedCode = format(templateCode, {
    parser: 'typescript',
    plugins: [TsParser],
  })

  return { importStatements, templateCodeText: formattedCode }
}
