/**

*/

import { GraphQLSchema, printSchema } from 'graphql'
import { TinaCloudSchema } from '@tinacms/schema-tools'

import fs from 'fs-extra'
import p from 'path'
import { generateTypes } from '../../codegen'
import { logText, warnText } from '../../utils/theme'
import { logger } from '../../logger'
import { transform } from 'esbuild'
export const TINA_HOST = 'content.tinajs.io'

export async function genClient(
  {
    tinaSchema,
    usingTs,
    rootPath,
  }: {
    tinaSchema: TinaCloudSchema<false>
    usingTs?: boolean
    rootPath: string
  },
  options
) {
  const generatedPath = p.join(rootPath, '.tina', '__generated__')
  const branch = tinaSchema?.config?.branch
  const clientId = tinaSchema?.config?.clientId
  const token = tinaSchema.config?.token
  const baseUrl =
    tinaSchema?.config?.tinaioConfig?.contentApiUrlOverride ||
    `https://${TINA_HOST}`

  if ((!branch || !clientId || !token) && !options?.local) {
    const missing = []
    if (!branch) missing.push('branch')
    if (!clientId) missing.push('clientId')
    if (!token) missing.push('token')

    throw new Error(
      `Client not configured properly. Missing ${missing.join(
        ', '
      )}. Please visit https://tina.io/docs/tina-cloud/connecting-site/ for more information`
    )
  }

  let apiURL = options.local
    ? `http://localhost:${options.port || 4001}/graphql`
    : `${baseUrl}/content/${clientId}/github/${branch}`

  if (tinaSchema.config?.contentApiUrlOverride) {
    apiURL = tinaSchema.config.contentApiUrlOverride
  }

  const clientPath = p.join(generatedPath, `client.${usingTs ? 'ts' : 'js'}`)
  fs.writeFileSync(
    clientPath,
    `import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: '${apiURL}', token: '${token}', queries });
export default client;
  `
  )
  return apiURL
}

export async function genTypes(
  {
    schema,
    usingTs,
    rootPath,
  }: { schema: GraphQLSchema; usingTs?: boolean; rootPath: string },
  next: () => void,
  options
) {
  const typesPath = rootPath + '/.tina/__generated__/types.ts'
  const typesJSPath = rootPath + '/.tina/__generated__/types.js'
  const typesDPath = rootPath + '/.tina/__generated__/types.d.ts'
  const fragPath = rootPath + '/.tina/__generated__/*.{graphql,gql}'
  const queryPathGlob = rootPath + '/.tina/queries/**/*.{graphql,gql}'

  const typescriptTypes = await generateTypes(
    schema,
    queryPathGlob,
    fragPath,
    options
  )
  const code = `//@ts-nocheck
  // DO NOT MODIFY THIS FILE. This file is automatically generated by Tina
  export function gql(strings: TemplateStringsArray, ...args: string[]): string {
    let str = ''
    strings.forEach((string, i) => {
      str += string + (args[i] || '')
    })
    return str
  }
  ${typescriptTypes}
  `
  if (usingTs) {
    await fs.outputFile(typesPath, code)
  } else {
    await fs.outputFile(typesDPath, code)
    const jsCode = await transform(code, { loader: 'ts' })
    await fs.outputFile(typesJSPath, jsCode.code)
  }

  const schemaString = await printSchema(schema)
  const schemaPath = rootPath + '/.tina/__generated__/schema.gql'

  await fs.outputFile(
    schemaPath,
    `# DO NOT MODIFY THIS FILE. This file is automatically generated by Tina
${schemaString}
schema {
  query: Query
  mutation: Mutation
}
  `
  )
  next()
}
