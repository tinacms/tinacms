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
import { Form, Field, TinaCMS } from '@tinacms/toolkit'
import { setIn, getIn } from 'final-form'

import type {
  DocumentBlueprint,
  FieldBlueprint,
  BlueprintPath,
  FormifiedDocumentNode,
  OnChangeEvent,
  FormNode,
  State,
  ChangeSet,
} from './types'

import {
  generateFormCreatorsUnstable,
  formifyCallback,
  transformDocumentIntoMutationRequestPayload,
  onSubmitArgs,
} from '../use-graphql-forms'
interface RecursiveFormifiedDocumentNode<T extends object>
  extends Array<RecursiveFormifiedDocumentNode<T> | T> {}

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
    return false
  }
}

export const isConnectionField = (type: G.GraphQLNamedType) => {
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

export function getNameAndAlias(
  fieldNode: G.FieldNode,
  list: boolean,
  isNode: boolean
) {
  return {
    name: fieldNode.name.value,
    alias: fieldNode.alias ? fieldNode.alias.value : fieldNode.name.value,
    list: !!list,
    isNode: !!isNode,
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

/**
 *
 *
 * ./index utilities
 *
 *
 */
export const getIn2 = <T extends object>(
  state: object,
  path: string
): RecursiveFormifiedDocumentNode<T> | T => {
  const pathArray = path.split('.')
  let latest = state
  pathArray.every((item, index) => {
    if (item === '[]') {
      const restOfItems = pathArray.slice(index + 1)
      if (latest) {
        const next = []
        if (Array.isArray(latest)) {
          latest.forEach((latest2, index) => {
            const res = getIn2(latest2, restOfItems.join('.'))
            next.push(res)
          })
        } else {
          throw new Error(`Expected value to be an array for "[]" item`)
        }
        if (next.length > 0) {
          latest = next
        } else {
          latest = undefined
        }
      }
      return false
    } else {
      if (latest) {
        latest = latest[item]
      } else {
        latest = undefined
      }
    }
    return true
  })
  // @ts-ignore
  return latest
}

/**
 * Returns the name of the field. In the example query, `title` and `t` would both be blueprint fields
 *
 * ```graphql
 * {
 *   getPostDocument(relativePath: $relativePath) {
 *     data {
 *       title,
 *       t: title # here `t` is an alias for title
 *     }
 *   }
 * }
 * ```
 */
export const getFieldNameOrAlias = (fieldBlueprint: FieldBlueprint) => {
  return fieldBlueprint.path[fieldBlueprint.path.length - 1].alias
}

const spliceLocation = (string: string, location: number[]) => {
  const accum: (string | number)[] = []
  let counter = 0

  string.split('.').forEach((item) => {
    if (item === '[]') {
      accum.push(location[counter])
      counter++
    } else {
      accum.push(item)
    }
  })

  return accum.join('.')
}

const getPathToChange = (
  documentBlueprint: DocumentBlueprint | FieldBlueprint,
  formNode: FormNode,
  event: OnChangeEvent
) => {
  const fieldName = event.field.name
  const location = [...formNode.location, ...stripIndices(fieldName)]
  const accum: (string | number)[] = []
  let counter = 0
  documentBlueprint.path.forEach((item) => {
    accum.push(item.alias)
    if (item.list) {
      // If there's no match we're assuming it's a list field, and not an item within the list field
      // eg. blocks vs blocks.0
      if (location[counter] !== undefined) {
        accum.push(location[counter])
        counter++
      }
    }
  })

  return accum.join('.')
}

export const buildForm = (
  doc: FormifiedDocumentNode,
  cms: TinaCMS,
  formify: formifyCallback,
  showInSidebar: boolean = false,
  onSubmit?: (args: onSubmitArgs) => void
): Form => {
  const { createForm, createGlobalForm } = generateFormCreatorsUnstable(
    cms,
    showInSidebar
  )
  const SKIPPED = 'SKIPPED'
  let form
  let skipped
  const skip = () => {
    skipped = SKIPPED
  }
  if (skipped) return

  const id = doc._internalSys.path
  const formConfig = {
    id,
    ...doc.form,
    label: doc.form.label,
    initialValues: doc.values,
    onSubmit: async (payload) => {
      try {
        const params = transformDocumentIntoMutationRequestPayload(
          payload,
          doc.form.mutationInfo
        )
        const variables = { params }
        const mutationString = doc.form.mutationInfo.string
        if (onSubmit) {
          onSubmit({
            queryString: mutationString,
            mutationString,
            variables,
          })
        } else {
          try {
            await cms.api.tina.request(mutationString, {
              variables,
            })
            cms.alerts.success('Document saved!')
          } catch (e) {
            cms.alerts.error('There was a problem saving your document')
            console.error(e)
          }
        }
      } catch (e) {
        console.error(e)
        cms.alerts.error('There was a problem saving your document')
      }
    },
  }
  if (formify) {
    form = formify(
      {
        formConfig,
        createForm,
        createGlobalForm,
        skip,
      },
      cms
    )
  } else {
    form = createForm(formConfig)
  }

  if (!(form instanceof Form)) {
    if (skipped === SKIPPED) {
      return
    }
    throw new Error('formify must return a form or skip()')
  }

  return form
}

export const formNodeId = (formNode: FormNode) => {
  return (
    spliceLocation(formNode.documentBlueprintId, formNode.location) +
    formNode.documentFormId
  )
}
export const formNodePath = (formNode: FormNode) => {
  return spliceLocation(formNode.documentBlueprintId, formNode.location)
}

export const formNodeNotIn = (formNode: FormNode, formNodes: FormNode[]) => {
  return !formNodes.find((fn) => formNodeId(fn) === formNodeId(formNode))
}

export const sequential = async <A, B>(
  items: A[] | undefined,
  callback: (args: A, idx: number) => Promise<B>
) => {
  const accum: B[] = []
  if (!items) {
    return []
  }

  const reducePromises = async (previous: Promise<B>, endpoint: A) => {
    const prev = await previous
    // initial value will be undefined
    if (prev) {
      accum.push(prev)
    }

    return callback(endpoint, accum.length)
  }

  // @ts-ignore FIXME: this can be properly typed
  const result = await items.reduce(reducePromises, Promise.resolve())
  if (result) {
    // @ts-ignore FIXME: this can be properly typed
    accum.push(result)
  }

  return accum
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

const getFormNodesStartingWith = (string: string, state: State) => {
  return state.formNodes.filter((subFormNode) => {
    return subFormNode.documentBlueprintId.startsWith(string)
  })
}

export const getFormNodesForField = (
  fieldBlueprint: FieldBlueprint,
  formNode: FormNode,
  event: OnChangeEvent,
  state: State
) => {
  const pathToChange = getPathToChange(fieldBlueprint, formNode, event)
  const formNodes = getFormNodesStartingWith(fieldBlueprint.id, state)
  const eventLocation = [
    ...formNode.location,
    ...stripIndices(event.field.name),
  ]
  const existing = getIn(state.data, pathToChange)
  return { pathToChange, formNodes, eventLocation, existing }
}

export const matchLocation = (eventLocation: number[], formNode: FormNode) => {
  return eventLocation.every((item, index) => item === formNode.location[index])
}

export const bumpLocation = (location: number[]) => {
  return location.map((item, index) => {
    // Bump the last item in the location array by 1, assuming "at" is always 0
    if (index === location.length - 1) {
      return item + 1
    }
    return item
  })
}

export const maybeLowerLocation = (location: number[], at: number) => {
  return location.map((item, index) => {
    // Bump the last item in the location array by 1, assuming "at" is always 0
    if (index === location.length - 1) {
      return item < at ? item : item - 1
    }
    return item
  })
}

export const matchesAt = (location: number[], at: number) => {
  let matches = false
  location.map((item, index) => {
    // Bump the last item in the location array by 1, assuming "at" is always 0
    if (index === location.length - 1) {
      if (item === at) {
        matches = true
      }
    }
  })
  return matches
}

export const swapLocation = (
  location: number[],
  mapping: { [key: number]: number }
) => {
  return location.map((item, index) => {
    if (index === location.length - 1) {
      return mapping[item]
    }
    return item
  })
}

export const getBlueprintAliasPath = (blueprint: DocumentBlueprint) => {
  const namePath = []
  const aliasPath = []
  blueprint.path.forEach((p) => {
    namePath.push(p.name)
    aliasPath.push(p.alias)
    if (p.list) {
      namePath.push('[]')
      aliasPath.push('[]')
    }
  })

  return aliasPath.join('.')
}

export const getBlueprintFieldsForEvent = (
  blueprint: DocumentBlueprint,
  event: OnChangeEvent
) => {
  return blueprint.fields.filter((fbp) => {
    return getBlueprintNamePath(fbp) === getEventPath(event, blueprint)
  })
}

export const getBlueprintNamePath = (
  blueprint: Pick<DocumentBlueprint, 'path'>
) => {
  const namePath = []
  const aliasPath = []
  blueprint.path.forEach((p) => {
    namePath.push(p.name)
    aliasPath.push(p.alias)
    if (p.list) {
      namePath.push('[]')
      aliasPath.push('[]')
    }
  })

  return namePath.join('.')
}

export const stripIndices = (string) => {
  const accum = []
  const stringArray = string.split('.')
  stringArray.forEach((item) => {
    if (isNaN(item)) {
    } else {
      accum.push(Number(item))
    }
  })

  return accum
}

export const replaceRealNum = (string) => {
  const stringArray = string.split('.')
  return stringArray
    .map((item) => {
      if (isNaN(item)) {
        return item
      }
      return '[]'
    })
    .join('.')
}

export const getFormNodesFromEvent = (state: State, event: OnChangeEvent) => {
  const formNodes = state.formNodes.filter(
    (formNode) => formNode.documentFormId === event.formId
  )
  return formNodes
}

export const printState = (state: State) => {
  let string = ''
  state.blueprints.forEach((blueprint) => {
    let bpString = `# Blueprint\n`
    bpString = bpString + `# ${blueprint.id}`
    bpString = bpString + `\n#`
    bpString = bpString + `\n# Documents for blueprint`
    bpString = bpString + `\n# ================`
    state.formNodes
      .filter((formNode) => formNode.documentBlueprintId === blueprint.id)
      .forEach((formNode) => {
        const newString = `# ${formNode.documentFormId}${
          blueprint.id.includes('[]')
            ? ` [${formNode.location.join(', ')}]`
            : ``
        }`
        bpString = bpString + `\n${newString}`
      })

    bpString = bpString + `\n#`
    bpString = bpString + `\n# Field blueprints`
    bpString = bpString + `\n# ================`
    blueprint.fields
      .filter((fbp) => fbp.documentBlueprintId === blueprint.id)
      .forEach((fbp) => {
        bpString = bpString + `\n# ${getFieldAliasForBlueprint(fbp.path)}`
        // bpString = bpString + `\n# ${fbp.id}`
      })
    string = string + `${bpString}\n`
    string = string + '\n'
  })
  string = string + `\n${state.queryString}`

  return string
}

const DATA_NODE_NAME = 'data'

const getEventPath = (
  event: OnChangeEvent,
  blueprint: DocumentBlueprint | FieldBlueprint
) => {
  const eventPath = replaceRealNum(event.field.name)
  const items = [blueprint.id, DATA_NODE_NAME, eventPath]
  const isList = event.field.data.tinaField.list
  // FIXME: there are some inconsistencies on what kind of shape the field is
  // when calling this, `list: true` for scalar vs object might be kind of off
  if (isList && !eventPath.endsWith('[]')) {
    items.push('[]')
  }
  return items.join('.')
}

export const printEvent = (event: OnChangeEvent) => {
  return {
    type: event.type,
    value: event.value,
    previousValue: event.previousValue,
    mutationType: event.mutationType,
    formId: event.formId,
    field: {
      data: event.field?.data,
      name: event.field?.name,
    },
  }
}

export const getFormNodeBlueprint = (formNode: FormNode, state: State) => {
  return state.blueprints.find((d) => d.id === formNode.documentBlueprintId)
}

export const getMoveMapping = (existing, from, to) => {
  const newOrderObject: { [key: number]: number } = {}
  if (from < to) {
    existing.map((_, i) => {
      if (i === from) {
        newOrderObject[i] = to
        return
      }
      if (i > from) {
        if (i < to) {
          newOrderObject[i] = i - 1
          return
        } else {
          if (i === to) {
            newOrderObject[i] = i - 1
            return
          }
          newOrderObject[i] = i
          return
        }
      } else {
        newOrderObject[i] = i
        return
      }
    })
  } else {
    existing.map((_, i) => {
      if (i === from) {
        newOrderObject[i] = to
        return
      }
      if (i > to) {
        if (i < from) {
          newOrderObject[i] = i + 1
          return
        } else {
          newOrderObject[i] = i
          return
        }
      } else {
        if (i === to) {
          newOrderObject[i] = i + 1
          return
        }
        newOrderObject[i] = i
        return
      }
    })
  }
  return newOrderObject
}

export const getPathsToChange = (
  event: OnChangeEvent,
  state: State
): {
  formNode: FormNode
  pathToChange: string
}[] => {
  const pathsToChange: { pathToChange: string; formNode: FormNode }[] = []
  const formNodes = getFormNodesFromEvent(state, event)

  formNodes.forEach((formNode) => {
    const blueprint = getFormNodeBlueprint(formNode, state)
    getBlueprintFieldsForEvent(blueprint, event).forEach((fieldBlueprint) => {
      const pathToChange = getPathToChange(fieldBlueprint, formNode, event)
      pathsToChange.push({ pathToChange, formNode })
    })
  })
  return pathsToChange
}

/**
 *
 * Gets the sub-fields for an object field, if it's a polymorphic
 * object then we also need to get the __typename, though
 * we should probably supply that regardless. The current downside
 * of this is that it needs to come from the server because we
 * have no way of knowing what it would be from the client-side
 */
export const getSubFields = (
  changeSet: ChangeSet
): { fields: Field[]; __typename: string } => {
  // @ts-ignore FIXME: import types from newly-defined defineSchema
  const fields = changeSet.fieldDefinition.fields
    ? // @ts-ignore FIXME: import types from newly-defined defineSchema
      changeSet.fieldDefinition.fields
    : // @ts-ignore FIXME: import types from newly-defined defineSchema
      changeSet.fieldDefinition.templates[changeSet.value[0]._template].fields

  let __typename
  // @ts-ignore FIXME: import types from newly-defined defineSchema
  if (changeSet.fieldDefinition?.templates) {
    // @ts-ignore FIXME: import types from newly-defined defineSchema
    __typename = changeSet.fieldDefinition.typeMap[changeSet.value[0]._template]
  }

  return { fields, __typename }
}
