import fs from 'fs-extra'
import path from 'path'
import { buildASTSchema, printSchema } from 'graphql'
import type { TypeDefinitionNode, GraphQLSchema } from 'graphql'
import { generateTypes } from './codegen'
import { transform } from 'esbuild'
import { ConfigManager } from '../config-manager'
import type { TinaSchema } from '@tinacms/schema-tools'
export const TINA_HOST = 'content.tinajs.io'

export class Codegen {
  configManager: ConfigManager
  port?: number
  schema: GraphQLSchema
  queryDoc: string
  fragDoc: string
  isLocal: boolean
  // The API url used in the client
  apiURL: string
  // This is always the local URL.
  localUrl: string
  // production url
  productionUrl: string
  graphqlSchemaDoc: {
    kind: 'Document'
    definitions: TypeDefinitionNode[]
  }
  tinaSchema: TinaSchema
  lookup: any

  constructor({
    configManager,
    port,
    queryDoc,
    fragDoc,
    isLocal,
    graphqlSchemaDoc,
    tinaSchema,
    lookup,
  }: {
    configManager: ConfigManager
    port?: number
    queryDoc: string
    fragDoc: string
    isLocal: boolean
    graphqlSchemaDoc: {
      kind: 'Document'
      definitions: TypeDefinitionNode[]
    }
    tinaSchema: TinaSchema
    lookup: any
  }) {
    this.isLocal = isLocal
    this.graphqlSchemaDoc = graphqlSchemaDoc
    this.configManager = configManager
    this.port = port
    this.schema = buildASTSchema(graphqlSchemaDoc)
    this.tinaSchema = tinaSchema
    this.queryDoc = queryDoc
    this.fragDoc = fragDoc
    this.lookup = lookup
  }

  async writeConfigFile(fileName: string, data: string) {
    const filePath = path.join(this.configManager.generatedFolderPath, fileName)
    await fs.ensureFile(filePath)
    await fs.outputFile(filePath, data)
    if (this.configManager.hasSeparateContentRoot()) {
      const filePath = path.join(
        this.configManager.generatedFolderPathContentRepo,
        fileName
      )
      await fs.ensureFile(filePath)
      await fs.outputFile(filePath, data)
    }
  }

  async removeGeneratedFilesIfExists() {
    await unlinkIfExists(this.configManager.generatedClientJSFilePath)
    await unlinkIfExists(this.configManager.generatedTypesDFilePath)
    await unlinkIfExists(this.configManager.generatedTypesJSFilePath)
    await unlinkIfExists(this.configManager.generatedTypesTSFilePath)
    await unlinkIfExists(this.configManager.generatedClientTSFilePath)
    await unlinkIfExists(this.configManager.generatedQueriesFilePath)
    await unlinkIfExists(this.configManager.generatedFragmentsFilePath)
  }

  async execute() {
    // Update Config Files

    // update _graphql.json
    await this.writeConfigFile(
      '_graphql.json',
      JSON.stringify(this.graphqlSchemaDoc)
    )
    // update _schema.json
    await this.writeConfigFile(
      '_schema.json',
      JSON.stringify(this.tinaSchema.schema)
    )
    // update _lookup.json
    await this.writeConfigFile('_lookup.json', JSON.stringify(this.lookup))

    const { apiURL, localUrl, tinaCloudUrl } = this._createApiUrl()
    this.apiURL = apiURL
    this.localUrl = localUrl
    this.productionUrl = tinaCloudUrl

    if (this.configManager.shouldSkipSDK()) {
      await this.removeGeneratedFilesIfExists()
      return apiURL
    }
    await fs.outputFile(
      this.configManager.generatedQueriesFilePath,
      this.queryDoc
    )
    await fs.outputFile(
      this.configManager.generatedFragmentsFilePath,
      this.fragDoc
    )
    await maybeWarnFragmentSize(this.configManager.generatedFragmentsFilePath)

    const { clientString } = await this.genClient()
    const { codeString, schemaString } = await this.genTypes()

    await fs.outputFile(
      this.configManager.generatedGraphQLGQLPath,
      schemaString
    )
    if (this.configManager.isUsingTs()) {
      await fs.outputFile(
        this.configManager.generatedTypesTSFilePath,
        codeString
      )
      await fs.outputFile(
        this.configManager.generatedClientTSFilePath,
        clientString
      )
      await unlinkIfExists(this.configManager.generatedClientJSFilePath)
      await unlinkIfExists(this.configManager.generatedTypesDFilePath)
      await unlinkIfExists(this.configManager.generatedTypesJSFilePath)
    } else {
      await fs.outputFile(
        this.configManager.generatedTypesDFilePath,
        codeString
      )
      const jsCode = await transform(codeString, { loader: 'ts' })
      await fs.outputFile(
        this.configManager.generatedTypesJSFilePath,
        jsCode.code
      )
      await fs.outputFile(
        this.configManager.generatedClientJSFilePath,
        clientString
      )
      await unlinkIfExists(this.configManager.generatedTypesTSFilePath)
      await unlinkIfExists(this.configManager.generatedClientTSFilePath)
    }
    return apiURL
  }
  private _createApiUrl() {
    const branch = this.configManager.config?.branch
    const clientId = this.configManager.config?.clientId
    const token = this.configManager.config?.token
    const version = this.configManager.getTinaGraphQLVersion()
    const baseUrl =
      this.configManager.config.tinaioConfig?.contentApiUrlOverride ||
      `https://${TINA_HOST}`

    if (
      (!branch || !clientId || !token) &&
      !this.port &&
      !this.configManager.config.contentApiUrlOverride
    ) {
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
    let localUrl = `http://localhost:${this.port}/graphql`
    let tinaCloudUrl = `${baseUrl}/${version}/content/${clientId}/github/${branch}`

    let apiURL = this.isLocal
      ? `http://localhost:${this.port}/graphql`
      : `${baseUrl}/${version}/content/${clientId}/github/${branch}`

    if (this.configManager.config.contentApiUrlOverride) {
      apiURL = this.configManager.config.contentApiUrlOverride
      localUrl = apiURL
      tinaCloudUrl = apiURL
    }
    return { apiURL, localUrl, tinaCloudUrl }
  }

  getApiURL() {
    if (!this.apiURL)
      throw new Error('apiURL not set. Please run execute() first')
    return this.apiURL
  }

  async genClient() {
    const token = this.configManager.config?.token
    const errorPolicy = this.configManager.config?.client?.errorPolicy
    const apiURL = this.getApiURL()

    const clientString = `import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: '${apiURL}', token: '${token}', queries, ${
      errorPolicy ? `errorPolicy: '${errorPolicy}'` : ''
    } });
export default client;
  `
    return { apiURL, clientString }
  }

  async genTypes() {
    const typescriptTypes = await generateTypes(
      this.schema,
      this.configManager.userQueriesAndFragmentsGlob,
      this.configManager.generatedQueriesAndFragmentsGlob,
      this.getApiURL()
    )
    const codeString = `//@ts-nocheck
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

    const schemaString = `# DO NOT MODIFY THIS FILE. This file is automatically generated by Tina
${await printSchema(this.schema)}
schema {
  query: Query
  mutation: Mutation
}
`
    return { codeString, schemaString }
  }
}

const maybeWarnFragmentSize = async (filepath: string) => {
  if (
    // is the file bigger then 100kb?
    (await (await fs.stat(filepath)).size) >
    // convert to 100 kb to bytes
    100 * 1024
  ) {
    console.warn(
      'Warning: frags.gql is very large (>100kb). Consider setting the reference depth to 1 or 0. See code snippet below.'
    )
    console.log(
      `const schema = defineSchema({
          client: {
              referenceDepth: 1,
          },
        // ...
    })`
    )
  }
}

const unlinkIfExists = async (filepath: string) => {
  if (await fs.existsSync(filepath)) {
    await fs.unlinkSync(filepath)
  }
}
