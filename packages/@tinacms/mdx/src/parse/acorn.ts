import type {
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
} from 'mdast-util-mdx-jsx'
import type { ExpressionStatement, ObjectExpression, Property } from 'estree'
import type { TinaFieldBase } from '@tinacms/schema-tools'
import { parseMDX } from '.'

export const extractAttributes = (
  attributes: MdxJsxAttribute[],
  fields: TinaFieldBase[]
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
    properties[attribute.name] = extractAttribute(attribute, field)
  })
  return properties
}
export const extractAttribute = (
  attribute: MdxJsxAttribute,
  field: TinaFieldBase
) => {
  switch (field.type) {
    case 'boolean':
    case 'number':
      return extractScalar(extractExpression(attribute), field)
    case 'datetime':
    case 'image':
    case 'string':
      if (field.list) {
        return extractScalar(extractExpression(attribute), field)
      } else {
        return extractString(attribute, field)
      }
    case 'reference':
      if (field.list) {
        return { id: extractScalar(extractExpression(attribute), field) }
      } else {
        return { id: extractString(attribute, field) }
      }
    case 'object':
      return extractObject(extractExpression(attribute), field)
    case 'rich-text':
      const JSXString = extractJSXFragment(
        extractExpression(attribute),
        attribute,
        field
      )
      return parseMDX(JSXString, field)
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
  attribute: { expression: { type: string } },
  baseAttribute: MdxJsxAttribute,
  field: T
) => {
  if (field.list) {
  } else {
    if (attribute.expression.type === 'JSXFragment') {
      assertHasType(attribute.expression.children[0])
      return attribute.expression.children[0].value.trim()
      if (typeof baseAttribute.value !== 'string') {
        return baseAttribute.value?.value
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
const extractString = (
  attribute: MdxJsxAttribute,
  field: Extract<TinaFieldBase, { type: 'string' }>
) => {
  if (attribute.type === 'mdxJsxAttribute') {
    if (typeof attribute.value === 'string') {
      return attribute.value
    }
  }
  return extractScalar(extractExpression(attribute), field)
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
    throw new Error(`Expected type to be ${type} but received ${val.type}`)
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
