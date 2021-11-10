/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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

import {
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
    prepend: visitor.getImports(),
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
