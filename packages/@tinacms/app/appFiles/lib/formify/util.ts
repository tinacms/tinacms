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

import { Form, Field, FormOptions, TinaCMS, AnyField, TinaField } from 'tinacms'
import { getIn } from 'final-form'

import type {
  DocumentBlueprint,
  FieldBlueprint,
  OnChangeEvent,
  FormNode,
  State,
  ChangeSet,
  BlueprintPath,
} from './types'
import { TinaSchema, resolveForm } from '@tinacms/schema-tools'

// import {
//   generateFormCreators,
//   formifyCallback,
//   transformDocumentIntoMutationRequestPayload,
//   onSubmitArgs,
// } from '../use-graphql-forms'

interface RecursiveFormifiedDocumentNode<T extends object>
  extends Array<RecursiveFormifiedDocumentNode<T> | T> {}
export const getValueForBlueprint = <T extends object>(
  state: object,
  path: string
): RecursiveFormifiedDocumentNode<T> | T => {
  const pathArray = path.split('.')
  let latest: object | undefined = state
  pathArray.every((item, index) => {
    if (item === '[]') {
      const restOfItems = pathArray.slice(index + 1)
      if (latest) {
        const next: (RecursiveFormifiedDocumentNode<object> | object)[] = []
        if (Array.isArray(latest)) {
          latest.forEach((latest2) => {
            const res = getValueForBlueprint(latest2, restOfItems.join('.'))
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

export const getNamePath = (path: BlueprintPath[]) => {
  const namePath: string[] = []
  path.forEach((p) => {
    namePath.push(p.name)
    if (p.list) {
      namePath.push('[]')
    }
  })

  return namePath.join('.')
}

export const getBlueprintNamePath = (
  blueprint: Pick<DocumentBlueprint, 'path'>,
  disambiguator?: boolean
) => {
  const namePath: string[] = []
  blueprint.path.forEach((p) => {
    if (disambiguator) {
      if (p.parentTypename) {
        namePath.push(p.parentTypename)
      }
    }
    namePath.push(p.name)
    if (p.list) {
      namePath.push('[]')
    }
  })

  return namePath.join('.')
}

interface RecursiveFormifiedDocumentNode<T extends object>
  extends Array<RecursiveFormifiedDocumentNode<T> | T> {}

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

export const spliceLocation = (string: string, location: number[] | null) => {
  const accum: (string | number)[] = []
  let counter = 0

  string.split('.').forEach((item) => {
    if (item === '[]') {
      if (!location) {
        throw new Error(`Error splicing without location`)
      }
      accum.push(location[counter])
      counter++
    } else {
      accum.push(item)
    }
  })

  return accum.join('.')
}

export const getPathToChange = (
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
  // const existing = getIn(state.data, pathToChange)
  return { pathToChange, formNodes, eventLocation, existing }
}

export const getBlueprintAliasPath = (blueprint: DocumentBlueprint) => {
  const namePath: string[] = []
  const aliasPath: string[] = []
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

export const getFieldAliasForBlueprint = (path: BlueprintPath[]) => {
  const reversePath = [...path].reverse()
  const accum: string[] = []
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
  return accum.reverse().join('.')
}

/**
 *
 * Determines the appropriate fields which should recieve an update from a form change
 *
 * In cases where there's polymorphic blocks, it's possible that an update would affect
 * multiple locations that it shouldn't.
 *
 * An OnChange event name can look like: `blocks.2.title`, but if there are 2 block elements
 * with a field of the same name, an event name it wouldn't be enough information for us.
 *
 * To get around this, the event sends the current `typename` along with it, and we use that
 * to determine where in our blueprint the value should be updated.
 *
 */
export const getBlueprintFieldsForEvent = (
  blueprint: DocumentBlueprint,
  event: OnChangeEvent
) => {
  return blueprint.fields
    .filter((fbp) => {
      if (getBlueprintNamePath(fbp) === getEventPath(event, blueprint)) {
        return true
      }
    })
    .filter((fbp) => {
      return filterFieldBlueprintsByParentTypename(
        fbp,
        event.field.data.tinaField.parentTypename
      )
    })
}

export const filterFieldBlueprintsByParentTypename = (
  fbp: FieldBlueprint,
  typename
) => {
  let lastDisambiguator: string

  fbp.path.forEach((path) => {
    if (path.parentTypename) {
      lastDisambiguator = path.parentTypename
    }
  })
  if (lastDisambiguator) {
    return typename === lastDisambiguator
  } else {
    return true
  }
}

/**
 *
 * Returns the path for the event, which uses `data.tinaField` metadata to
 * determine the shape of the field. For polymorphic objects it's necessary
 * to build-in the name of the GraphQL type that's receiving the change.
 *
 * Eg. when the title of a blocks "cta" template is changed, we might see an
 * event path like:
 * ```
 * getPageDocument.data.blocks.0.PageBlocksCta.title
 * ```
 */
const getEventPath = (
  event: OnChangeEvent,
  blueprint: DocumentBlueprint | FieldBlueprint
) => {
  const stringArray = event.field.name.split('.')
  const eventPath = stringArray
    .map((item) => {
      if (isNaN(Number(item))) {
        return item
      }
      return `[]`
    })
    .join('.')
  const items = [blueprint.id, eventPath]
  const isList = event.field.data.tinaField.list
  if (isList && !eventPath.endsWith('[]')) {
    items.push(`[]`)
  }
  return items.join('.')
}

export const stripIndices = (string) => {
  const accum: string[] = []
  const stringArray = string.split('.')
  stringArray.forEach((item) => {
    if (isNaN(item)) {
    } else {
      accum.push(item)
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

export const getMatchName = ({
  field,
  prefix,
  blueprint,
}: {
  field: TinaField
  prefix?: string
  blueprint: DocumentBlueprint
}) => {
  const fieldName = field.list ? `${field.name}.[]` : field.name
  const blueprintName = getBlueprintNamePath(blueprint)
  const extra: string[] = []
  if (prefix) {
    extra.push(prefix)
  }
  const matchName = [blueprintName, ...extra, fieldName].join('.')
  return { matchName, fieldName }
}

export const getFormNodesFromEvent = (state: State, event: OnChangeEvent) => {
  const formNodes = state.formNodes.filter(
    (formNode) => formNode.documentFormId === event.formId
  )
  return formNodes
}

export const getBlueprintFieldPath = (
  blueprint: DocumentBlueprint,
  blueprintField: FieldBlueprint
) => {
  return blueprintField.path.slice(blueprint.path.length)
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
        // bpString = bpString + `\n# ${getBlueprintAliasPath(fbp)}`
        // bpString = bpString + `\n# ${fbp.id}`
      })
    string = string + `${bpString}\n`
    string = string + '\n'
  })
  string = string + `\n${state.queryString}`

  return string
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
