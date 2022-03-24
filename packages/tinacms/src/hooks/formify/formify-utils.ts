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

import type { BlueprintPath } from './types'
import { getBlueprintNamePath } from './util'

export const isDocumentField = (t: G.GraphQLOutputType) => {
  const type = G.getNamedType(t)
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
    return false
  }
}

export const isScalarType = (t: G.GraphQLOutputType) => {
  const namedType = G.getNamedType(t)
  return G.isScalarType(namedType)
}

export const isConnectionField = (t: G.GraphQLOutputType) => {
  const type = G.getNamedType(t)
  if (G.isObjectType(type)) {
    return !!type.getInterfaces().find((intfc) => intfc.name === 'Connection')
  } else {
    throw new Error(`Expected GraphQLObjectType for isConnectionField check`)
  }
}

/**
 * Selects the appropriate field from a GraphQLObject based on the selection's name
 */
export const getObjectField = (
  object: G.GraphQLOutputType,
  selectionNode: G.FieldNode
) => {
  const namedType = G.getNamedType(object)
  ensureObjectType(namedType)
  return namedType.getFields()[selectionNode.name.value]
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
  unionType: G.GraphQLOutputType,
  selectionNode: G.InlineFragmentNode
) => {
  const namedType = G.getNamedType(unionType)
  ensureUnionType(namedType)
  return namedType
    .getTypes()
    .find((type) => type.name === selectionNode.typeCondition.name.value)
}

/**
 * Checks if the given type is a list type. Even though
 * this function is built-in to GraphQL it doesn't handle
 * the scenario where the list type is wrapped in a non-null
 * type, so the extra check here is needed.
 */
export function isListType(type: unknown) {
  if (G.isListType(type)) {
    return true
  } else if (G.isNonNullType(type)) {
    if (G.isListType(type.ofType)) {
      return true
    }
  }
  return false
}

/**
 *
 * Throws an error if the provided type is no a GraphQLUnionType
 */
function ensureUnionType(type: unknown): asserts type is G.GraphQLUnionType {
  if (!G.isUnionType(type)) {
    throw new Error(`Expected type to be GraphQLUnionType`)
  }
}

/**
 *
 * Throws an error if the provided type is no a GraphQLUnionType
 */
function ensureObjectType(type: unknown): asserts type is G.GraphQLObjectType {
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
 * Generates the name and alias information for a given field node
 * and appends it to a shallow copy of the path provided
 */
export function buildPath({
  fieldNode,
  type,
  parentTypename,
  path,
}: {
  fieldNode: G.FieldNode
  type: G.GraphQLOutputType
  parentTypename?: string
  path?: BlueprintPath[]
}): BlueprintPath[] {
  const p = path || []
  const list = isListType(type)
  const isNode = isDocumentField(type)
  return [
    ...p,
    {
      name: fieldNode.name.value,
      alias: fieldNode.alias ? fieldNode.alias.value : fieldNode.name.value,
      parentTypename: parentTypename,
      list: !!list,
      isNode: !!isNode,
    },
  ]
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

export const getRelativeBlueprint = (path: BlueprintPath[]) => {
  let indexOfLastNode = 0
  path.forEach((item, i) => {
    if (item.isNode) {
      if (i === path.length - 1) {
        // skip if the item is a node, we still want to treat it as a field for the parent
      } else {
        indexOfLastNode = i
      }
    }
  })

  const documentBlueprintPath = path.slice(0, indexOfLastNode + 1)
  return getBlueprintNamePath({ path: documentBlueprintPath })
}

export const getBlueprintId = (path: BlueprintPath[]) => {
  const namePath = []
  const aliasPath = []
  path.forEach((p) => {
    namePath.push(p.name)
    aliasPath.push(p.alias)
    if (p.list) {
      namePath.push('[]')
      aliasPath.push('[]')
    }
  })

  return namePath.join('.')
}

export const getFieldAliasForBlueprint = (path: BlueprintPath[]) => {
  const reversePath = [...path].reverse()
  const accum = []
  reversePath.every((item, index) => {
    if (index === 0) {
      if (item.list) {
        accum.push('[]')
      }
      accum.push(item.alias)
    } else {
      if (item.isNode) {
        return false
      }
      if (item.list) {
        accum.push('[]')
      }
      accum.push(item.alias)
    }
    return true
  })
  return accum.reverse().slice(1).join('.')
}
