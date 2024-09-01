import type {
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
  MdxJsxExpressionAttribute,
} from 'mdast-util-mdx-jsx'
import type { ExpressionStatement, ObjectExpression, Property } from 'estree'
import type { TinaField } from '@tinacms/schema-tools'
import { MDX_PARSE_ERROR_MSG, parseMDX } from '.'

type TinaStringField =
  | Extract<TinaField, { type: 'string' }>
  | Extract<TinaField, { type: 'datetime' }>
  | Extract<TinaField, { type: 'image' }>
  | Extract<TinaField, { type: 'reference' }>

export const extractAttributes = (
  attributes: (MdxJsxAttribute | MdxJsxExpressionAttribute)[],
  fields: TinaField[],
  imageCallback: (image: string) => string,
  context: Record<string, unknown> | undefined
) => {
  const properties: Record<string, unknown> = {}
  attributes?.forEach((attribute) => {
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
        imageCallback,
        context
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
  field: TinaField,
  imageCallback: (image: string) => string,
  context: Record<string, unknown> | undefined
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
      return extractObject(extractExpression(attribute), field, imageCallback)
    case 'rich-text':
      if (attribute.type === 'mdxJsxAttribute') {
        if (typeof attribute.value === 'string') {
          if (attribute.value.startsWith('_tinaEmbeds')) {
            const embedValue = context?._tinaEmbeds as Record<string, unknown>
            const key = attribute.value.split('.')[1]
            if (typeof key !== 'string') {
              throw new Error(`Unable to extract key from embed value`)
            }
            const value = embedValue[key]
            if (typeof value === 'string') {
              const ast = parseMDX(value, field, imageCallback, context)
              ast.embedCode = attribute.value.split('.')[1]
              return ast
            }
          }
        }
      }
      const JSXString = extractRaw(attribute)
      if (JSXString) {
        return parseMDX(JSXString, field, imageCallback)
      } else {
        return {}
      }
    default:
      throw new Error(`Extract attribute: Unhandled field type ${field.type}`)
  }
}

const extractScalar = <
  T extends Extract<
    TinaField,
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

const extractObject = <T extends Extract<TinaField, { type: 'object' }>>(
  attribute: ExpressionStatement,
  field: T,
  imageCallback: (image: string) => string
) => {
  if (field.list) {
    assertType(attribute.expression, 'ArrayExpression')
    return attribute.expression.elements.map((element) => {
      assertHasType(element)
      assertType(element, 'ObjectExpression')
      return extractObjectExpression(element, field, imageCallback)
    })
  } else {
    assertType(attribute.expression, 'ObjectExpression')
    return extractObjectExpression(attribute.expression, field, imageCallback)
  }
}
const extractObjectExpression = (
  expression: ObjectExpression,
  field: Extract<TinaField, { type: 'object' }>,
  imageCallback: (image: string) => string
) => {
  const properties: Record<string, unknown> = {}
  expression.properties?.forEach((property) => {
    assertType(property, 'Property')
    const { key, value } = extractKeyValue(property, field, imageCallback)
    properties[key] = value
  })
  return properties
}

const getField = (
  objectField: Extract<TinaField, { type: 'object' }>,
  name: string
) => {
  if (objectField.fields) {
    if (typeof objectField.fields === 'string') {
      throw new Error('Global templates not supported')
    }
    return objectField.fields.find((f) => f.name === name)
  }
}

const extractKeyValue = (
  property: Property,
  parentField: Extract<TinaField, { type: 'object' }>,
  imageCallback: (image: string) => string
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
        return extractObjectExpression(element, field, imageCallback)
      })
      return { key, value }
    } else {
      assertType(property.value, 'ObjectExpression')
      const value = extractObjectExpression(
        property.value,
        field,
        imageCallback
      )
      return { key, value }
    }
  } else if (field?.list) {
    assertType(property.value, 'ArrayExpression')
    const value = property.value.elements.map((element) => {
      assertHasType(element)
      assertType(element, 'Literal')
      return element.value
    })
    return { key, value }
  } else if (field?.type === 'rich-text') {
    assertType(property.value, 'Literal')
    const raw = property.value.value
    if (typeof raw === 'string') {
      return { key, value: parseMDX(raw, field, imageCallback) }
    }
    throw new Error(`Unable to parse rich-text`)
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

/**
 * When rich-text is nested in non-children elements, we use a
 * fragment to denote it's MDX:
 *
 * ```mdx
 * ## hello
 *
 * <MyComponent description={<>
 *   # My nested description
 * </>}>
 *   ## Some children
 * </MyComponent>
 * ```
 * This grabs the inner fragment and strips out the `<></>` portions
 * so when we pass it into our parser it's treated as markdown instead
 * of an expression
 */
const extractRaw = (attribute: MdxJsxAttribute): string => {
  assertType(attribute, 'mdxJsxAttribute')
  assertHasType(attribute.value)
  assertType(attribute.value, 'mdxJsxAttributeValueExpression')
  const rawValue = attribute.value.value
  return trimFragments(rawValue)
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

export const trimFragments = (string: string) => {
  const rawArr = string.split('\n')
  let openingFragmentIndex: number | null = null
  let closingFragmentIndex: number | null = null
  rawArr.forEach((item, index) => {
    if (item.trim() === '<>') {
      if (!openingFragmentIndex) {
        openingFragmentIndex = index + 1
      }
    }
  })
  rawArr.reverse().forEach((item, index) => {
    if (item.trim() === '</>') {
      const length = rawArr.length - 1
      if (!closingFragmentIndex) {
        closingFragmentIndex = length - index
      }
    }
  })
  const value = rawArr
    .reverse()
    .slice(openingFragmentIndex || 0, closingFragmentIndex || rawArr.length - 1)
    .join('\n')
  return value
}
