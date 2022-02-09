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

import * as G from 'graphql'

export const isNodeField = (type: G.GraphQLNamedType) => {
  if (G.isUnionType(type)) {
    return type.getTypes().every((type) => {
      return type.getInterfaces().find((intfc) => intfc.name === 'Node')
    })
  } else if (G.isObjectType(type)) {
    return !!type.getInterfaces().find((intfc) => intfc.name === 'Node')
  } else if (G.isInterfaceType(type)) {
    if (type.name === 'Node') {
      return true
    }
  } else {
    throw new Error(
      `Expected GraphQLObjectType or GraphQLUnionType for isNodeField check`
    )
  }
}

// FIXME: should delete
export const isCollectionField = (type: G.GraphQLNamedType) => {
  return isConnectionField(type)
}
export const isConnectionField = (type: G.GraphQLNamedType) => {
  if (G.isObjectType(type)) {
    return !!type.getInterfaces().find((intfc) => intfc.name === 'Connection')
  } else {
    throw new Error(`Expected GraphQLObjectType for isCollectionField check`)
  }
}

/**
 * Selects the appropriate field from a GraphQLObject based on the selection's name
 */
export const getObjectField = (
  object: G.GraphQLObjectType<any, any>,
  selectionNode: G.FieldNode
) => {
  return object.getFields()[selectionNode.name.value]
}

/**
 * Selects the appropriate type from a union based on the selection's typeCondition
 *
 * ```graphql
 * post {
 *    # would return PostDocument
 *   ...on PostDocument { ... }
 * }
 * ```
 */
export const getSelectedUnionType = (
  unionType: G.GraphQLUnionType,
  selectionNode: G.InlineFragmentNode
) => {
  return unionType
    .getTypes()
    .find((type) => type.name === selectionNode.typeCondition.name.value)
}

/**
 *
 * Throws an error if the provided type is no a GraphQLUnionType
 */
export function ensureNodeField(field: G.GraphQLNamedType) {
  if (!isNodeField(field)) {
    throw new Error(`Expected field to implement Node interface`)
  }
}

/**
 *
 * Throws an error if the provided type is no a GraphQLUnionType
 */
export function ensureUnionType(
  type: unknown
): asserts type is G.GraphQLUnionType {
  if (!G.isUnionType(type)) {
    throw new Error(`Expected type to be GraphQLUnionType`)
  }
}

/**
 *
 * Throws an error if the provided type is no a GraphQLUnionType
 */
export function ensureObjectType(
  type: unknown
): asserts type is G.GraphQLObjectType {
  if (!G.isObjectType(type)) {
    console.log(type)
    throw new Error(`Expected type to be GraphQLObjectType`)
  }
}

/**
 *
 * Throws an error if the provided type is no a GraphQLUnionType
 */
export function ensureOperationDefinition(
  type: G.DefinitionNode
): asserts type is G.OperationDefinitionNode {
  if (type.kind !== 'OperationDefinition') {
    throw new Error(
      `Expected top-level definition to be an OperationDefinition node, ensure your query has been optimized before calling formify`
    )
  }
}

/**
 * This is a dummy query which we pull apart and spread
 * back into the the selectionSet for all "Node" fields
 */
const node = G.parse(`
 query Sample {
   _internalSys: sys {
     path
     collection {
       name
     }
   }
   form
   values
 }`)
export const metaFields: G.SelectionNode[] =
  // @ts-ignore
  node.definitions[0].selectionSet.selections
