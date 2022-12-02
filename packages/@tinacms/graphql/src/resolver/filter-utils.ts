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

import {
  ObjectField,
  ReferenceField,
  SchemaField,
  Template,
} from '@tinacms/schema-tools'
import type { FilterCondition } from '@tinacms/datalayer'

export type ReferenceResolver = (
  filter: Record<string, object>,
  fieldDefinition: ReferenceField
) => Promise<{
  edges: {
    node: any
  }[]
  values: any[]
}>

export const resolveReferences = async (
  filter: any,
  fields: SchemaField[],
  resolver: ReferenceResolver
) => {
  for (const fieldKey of Object.keys(filter)) {
    const fieldDefinition = (fields as SchemaField[]).find(
      (f) => f.name === fieldKey
    )
    // resolve top level references
    if (fieldDefinition) {
      if (fieldDefinition.type === 'reference') {
        const { edges, values } = await resolver(filter, fieldDefinition)

        if (edges.length === 1) {
          filter[fieldKey] = {
            eq: values[0],
          }
        } else if (edges.length > 1) {
          filter[fieldKey] = {
            in: values,
          }
        } else {
          // TODO is there a better way to short-circuit this? For an AND filter we can just give up here but OR would just ignore this
          filter[fieldKey] = {
            eq: '___null___',
          }
        }
      } else if (fieldDefinition.type === 'object') {
        if (fieldDefinition.templates) {
          for (const templateName of Object.keys(filter[fieldKey])) {
            const template = (fieldDefinition as ObjectField).templates.find(
              (template) =>
                !(typeof template === 'string') &&
                template.name === templateName
            ) as any
            if (template) {
              await resolveReferences(
                filter[fieldKey][templateName],
                template.fields,
                resolver
              )
            } else {
              throw new Error(`Template ${templateName} not found`)
            }
          }
        } else {
          await resolveReferences(
            filter[fieldKey],
            fieldDefinition.fields,
            resolver
          )
        }
      }
    } else {
      throw new Error(`Unable to find field ${fieldKey}`)
    }
  }
}

const collectConditionsForChildFields = (
  filterNode: Record<string, object>,
  fields: SchemaField[],
  pathExpression: string,
  collectCondition: (condition: FilterCondition) => void
) => {
  for (const childFieldName of Object.keys(filterNode)) {
    const childField = fields.find((field) => field.name === childFieldName)
    if (!childField) {
      throw new Error(`Unable to find type for field ${childFieldName}`)
    }

    collectConditionsForField(
      childFieldName,
      childField,
      filterNode[childFieldName] as Record<string, object>,
      pathExpression,
      collectCondition
    )
  }
}

const collectConditionsForObjectField = (
  fieldName: string,
  field: ObjectField,
  filterNode: Record<string, object>,
  pathExpression: string,
  collectCondition: (condition: FilterCondition) => void
) => {
  if (field.list && field.templates) {
    for (const [filterKey, childFilterNode] of Object.entries(filterNode)) {
      const template = field.templates.find(
        (template) =>
          !(typeof template === 'string') && template.name === filterKey
      ) as Template
      const jsonPath = `${fieldName}[?(@._template=="${filterKey}")]`
      const filterPath = pathExpression
        ? `${pathExpression}.${jsonPath}`
        : jsonPath

      collectConditionsForChildFields(
        childFilterNode as Record<string, object>,
        template.fields,
        filterPath,
        collectCondition
      )
    }
  } else {
    const jsonPath = `${fieldName}${field.list ? '[*]' : ''}`
    const filterPath = pathExpression
      ? `${pathExpression}.${jsonPath}`
      : `${jsonPath}`

    collectConditionsForChildFields(
      filterNode,
      field.fields,
      filterPath,
      collectCondition
    )
  }
}

export const collectConditionsForField = (
  fieldName: string,
  field: SchemaField,
  filterNode: Record<string, object>,
  pathExpression: string,
  collectCondition: (condition: FilterCondition) => void
) => {
  if (field.type === 'object') {
    collectConditionsForObjectField(
      fieldName,
      field,
      filterNode,
      pathExpression,
      collectCondition
    )
  } else {
    collectCondition({
      filterPath: pathExpression ? `${pathExpression}.${fieldName}` : fieldName,
      filterExpression: {
        _type: field.type,
        ...filterNode,
      },
    })
  }
}
