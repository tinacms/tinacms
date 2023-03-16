/**

*/

/**
 * PLEASE READ THIS:
 *
 * This plugin is directly copied from https://github.com/dotansimha/graphql-code-generator/tree/master/packages/plugins/typescript/generic-sdk
 *
 * The reason this was needed is because we had to modified the return type of the SDK client. We need to return {data, variables, query}. While the other one just returned the data.
 *
 * This is the same as the above link and may need to be updated time to time. (for example if we want to support GQL v16). There is only one line that differs from the original. (This is shown)
 */

import type {
  PluginFunction,
  PluginValidateFn,
  Types,
} from '@graphql-codegen/plugin-helpers'
import { visit } from 'graphql'

import {
  LoadedFragment,
  RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common'
import { concatAST, FragmentDefinitionNode, GraphQLSchema, Kind } from 'graphql'
import { extname } from 'path'
import { RawGenericSdkPluginConfig } from './config'
import { GenericSdkVisitor } from './visitor'

export const plugin: PluginFunction<RawGenericSdkPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: RawGenericSdkPluginConfig
) => {
  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.document]
    }, [])
  )
  const allFragments: LoadedFragment[] = [
    ...(
      allAst.definitions.filter(
        (d) => d.kind === Kind.FRAGMENT_DEFINITION
      ) as FragmentDefinitionNode[]
    ).map((fragmentDef) => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false,
    })),
    ...(config.externalFragments || []),
  ]
  const visitor = new GenericSdkVisitor(schema, allFragments, config)
  const visitorResult = visit(allAst, { leave: visitor as any })

  return {
    // We will take care of imports
    // prepend: visitor.getImports(),
    content: [
      visitor.fragments,
      ...visitorResult.definitions.filter((t) => typeof t === 'string'),
      visitor.sdkContent,
    ].join('\n'),
  }
}

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: RawClientSideBasePluginConfig,
  outputFile: string
) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(
      `Plugin "typescript-generic-sdk" requires extension to be ".ts"!`
    )
  }
}

export { GenericSdkVisitor }
