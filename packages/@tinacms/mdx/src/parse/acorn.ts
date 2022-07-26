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
import type {
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
  MdxJsxExpressionAttribute,
} from 'mdast-util-mdx-jsx'
import type { JSXFragment, JSXText } from 'estree-jsx'
import type { ExpressionStatement, ObjectExpression, Property } from 'estree'
import type { TinaFieldBase } from '@tinacms/schema-tools'
import { MDX_PARSE_ERROR_MSG, parseMDX } from '.'

type TinaStringField =
  | Extract<TinaFieldBase, { type: 'string' }>
  | Extract<TinaFieldBase, { type: 'datetime' }>
  | Extract<TinaFieldBase, { type: 'image' }>
  | Extract<TinaFieldBase, { type: 'reference' }>

export const extractAttributes = (
  attributes: (MdxJsxAttribute | MdxJsxExpressionAttribute)[],
  fields: TinaFieldBase[],
  imageCallback: (image: string) => string
) => {
  const properties: Record<string, unknown> = {}
  attributes.forEach((attribute) => {
    assertType(attribute, 'mdxJsxAttribute')
    const field = fields.find((field) => field.name === attribute.name)
    if (!field) {
      throw new Error(
        `Unable to find field definition for property "${attribute.name}"`
      )
    }
    try {
      properties[attribute.name] = extractAttribute(
        attribute,
        field,
        imageCallback
      )
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(
          `Unable to parse field value for field "${field.name}" (type: ${field.type}). ${e.message}`
        )
      }
      throw e
    }
  })
  return properties
}
const extractAttribute = (
  attribute: MdxJsxAttribute,
  field: TinaFieldBase,
  imageCallback: (image: string) => string
) => {
  switch (field.type) {
    case 'boolean':
    case 'number':
      return extractScalar(extractExpression(attribute), field)
    case 'datetime':
    case 'string':
      if (field.list) {
        return extractScalar(extractExpression(attribute), field)
      } else {
        return extractString(attribute, field)
      }
    case 'image':
      if (field.list) {
        const values = extractScalar(
          extractExpression(attribute),
          field
        ) as string
        return values.split(',').map((value) => imageCallback(value))
      } else {
        const value = extractString(attribute, field)
        return imageCallback(value)
      }
    case 'reference':
      if (field.list) {
        return extractScalar(extractExpression(attribute), field)
      } else {
        return extractString(attribute, field)
      }
    case 'object':
      return extractObject(extractExpression(attribute), field)
    case 'rich-text':
      const JSXString = extractJSXFragment(
        // @ts-ignore FIXME: estree-jsx needs to be merged with estree
        extractExpression(attribute),
        attribute,
        field
      )
      if (JSXString) {
        return parseMDX(JSXString, field, imageCallback)
      } else {
        return {}
      }
    default:
      // @ts-expect-error
      throw new Error(`Extract attribute: Unhandled field type ${field.type}`)
  }
}

const extractScalar = <
  T extends Extract<
    TinaFieldBase,
    | { type: 'string' }
    | { type: 'boolean' }
    | { type: 'number' }
    | { type: 'datetime' }
    | { type: 'image' }
    | { type: 'reference' }
  >
>(
  attribute: ExpressionStatement,
  field: T
) => {
  if (field.list) {
    assertType(attribute.expression, 'ArrayExpression')
    return attribute.expression.elements.map((element) => {
      assertHasType(element)
      assertType(element, 'Literal')
      return element.value
    })
  } else {
    assertType(attribute.expression, 'Literal')
    return attribute.expression.value
  }
}

const extractObject = <T extends Extract<TinaFieldBase, { type: 'object' }>>(
  attribute: ExpressionStatement,
  field: T
) => {
  if (field.list) {
    assertType(attribute.expression, 'ArrayExpression')
    return attribute.expression.elements.map((element) => {
      assertHasType(element)
      assertType(element, 'ObjectExpression')
      return extractObjectExpression(element, field)
    })
  } else {
    assertType(attribute.expression, 'ObjectExpression')
    return extractObjectExpression(attribute.expression, field)
  }
}
const extractObjectExpression = (
  expression: ObjectExpression,
  field: Extract<TinaFieldBase, { type: 'object' }>
) => {
  const properties: Record<string, unknown> = {}
  expression.properties.forEach((property) => {
    assertType(property, 'Property')
    const { key, value } = extractKeyValue(property, field)
    properties[key] = value
  })
  return properties
}

const getField = (
  objectField: Extract<TinaFieldBase, { type: 'object' }>,
  name: string
) => {
  if (objectField.fields) {
    if (typeof objectField.fields === 'string') {
      throw new Error('Global templates not supported')
    }
    return objectField.fields.find((f) => f.name === name)
  }
}

const extractJSXFragment = <
  T extends Extract<TinaFieldBase, { type: 'rich-text' }>
>(
  attribute: { expression: JSXFragment },
  baseAttribute: MdxJsxAttribute,
  field: T
) => {
  if (field.list) {
  } else {
    if (attribute.expression.type === 'JSXFragment') {
      assertHasType(attribute.expression)
      if (attribute.expression.children[0]) {
        const firstChild = attribute.expression.children[0]
        if (attribute.expression.children[0].type === 'JSXText') {
          const child = firstChild as JSXText
          return child.value.trim()
        }
      }
    }
  }
  throwError(field)
}

const extractKeyValue = (
  property: Property,
  parentField: Extract<TinaFieldBase, { type: 'object' }>
) => {
  assertType(property.key, 'Identifier')
  const key = property.key.name
  const field = getField(parentField, key)
  if (field?.type === 'object') {
    if (field.list) {
      assertType(property.value, 'ArrayExpression')
      const value = property.value.elements.map((element) => {
        assertHasType(element)
        assertType(element, 'ObjectExpression')
        return extractObjectExpression(element, field)
      })
      return { key, value }
    } else {
      assertType(property.value, 'ObjectExpression')
      const value = extractObjectExpression(property.value, field)
      return { key, value }
    }
  } else {
    assertType(property.value, 'Literal')
    return { key, value: property.value.value }
  }
}

const extractStatement = (
  attribute: MdxJsxAttributeValueExpression
): ExpressionStatement => {
  const body = attribute.data?.estree?.body
  if (body) {
    if (body[0]) {
      assertType(body[0], 'ExpressionStatement')
      // @ts-ignore incomplete types available Directive | ExpressionStatement
      return body[0]
    }
  }

  throw new Error(`Unable to extract body from expression`)
}

/**
 *
 * JSX props can be either expressions, or in the case of non-list strings, literals
 * eg. `<Cta label="hello" />` or `<Cta label={"hello"} />` are both valid
 */
const extractString = (attribute: MdxJsxAttribute, field: TinaStringField) => {
  if (attribute.type === 'mdxJsxAttribute') {
    if (typeof attribute.value === 'string') {
      return attribute.value
    }
  }
  return extractScalar(extractExpression(attribute), field) as string
}

const extractExpression = (attribute: MdxJsxAttribute): ExpressionStatement => {
  assertType(attribute, 'mdxJsxAttribute')
  assertHasType(attribute.value)
  assertType(attribute.value, 'mdxJsxAttributeValueExpression')
  return extractStatement(attribute.value)
}

function assertType<T extends { type: string }, U extends T['type']>(
  val: T,
  type: U
): asserts val is Extract<T, { type: U }> {
  if (val.type !== type) {
    throw new Error(
      `Expected type to be ${type} but received ${val.type}. ${MDX_PARSE_ERROR_MSG}`
    )
  }
}

function assertHasType(
  val: null | undefined | string | { type: string }
): asserts val is { type: string } {
  if (val) {
    if (typeof val !== 'string') {
      return
    }
  }
  throw new Error(`Expect value to be an object with property "type"`)
}

const throwError = (field: TinaFieldBase) => {
  throw new Error(
    `Unexpected expression for field "${field.name}"${
      field.list ? ' with "list": true' : ''
    }`
  )
}
