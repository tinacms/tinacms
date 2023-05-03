/**

*/

import type {
  ObjectType,
  ReferenceType,
  Template,
  TinaField,
} from '@tinacms/schema-tools'
import { FilterCondition } from '../database/datalayer'

export type ReferenceResolver = (
  filter: Record<string, object>,
  fieldDefinition: ReferenceType
) => Promise<{
  edges: {
    node: any
  }[]
  values: any[]
}>

export const resolveReferences = async (
  filter: any,
  fields: TinaField[],
  resolver: ReferenceResolver
) => {
  for (const fieldKey of Object.keys(filter)) {
    const fieldDefinition = (fields as TinaField[]).find(
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
            const template = (fieldDefinition as ObjectType).templates.find(
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
            fieldDefinition.fields as TinaField[],
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
  fields: TinaField[],
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
  field: ObjectType,
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
      field.fields as TinaField[],
      filterPath,
      collectCondition
    )
  }
}

export const collectConditionsForField = (
  fieldName: string,
  field: TinaField,
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
        _list: !!field.list,
        ...filterNode,
      },
    })
  }
}
