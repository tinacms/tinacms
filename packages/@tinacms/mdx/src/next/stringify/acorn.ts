// @ts-ignore TODO: Fix this
import prettier from 'prettier/esm/standalone.mjs'
// @ts-ignore TODO: Fix this
import parser from 'prettier/esm/parser-espree.mjs'
import type { RichTextField, RichTextTemplate } from '@tinacms/schema-tools'
import type { MdxJsxAttribute } from 'mdast-util-mdx-jsx'
import * as Plate from '../../parse/plate'
import type * as Md from 'mdast'
import { rootElement } from './pre-processing'
import { stringifyMDX } from '.'

export const stringifyPropsInline = (
  element: Plate.MdxInlineElement,
  field: RichTextField,
  imageCallback: (url: string) => string
): { attributes: MdxJsxAttribute[]; children: Md.PhrasingContent[] } => {
  return stringifyProps(element, field, true, imageCallback)
}
export function stringifyProps(
  element: Plate.MdxInlineElement,
  parentField: RichTextField,
  flatten: boolean,
  imageCallback: (url: string) => string
): {
  attributes: MdxJsxAttribute[]
  children: Md.PhrasingContent[]
  useDirective: boolean
  directiveType: string
}
export function stringifyProps(
  element: Plate.MdxBlockElement,
  parentField: RichTextField,
  flatten: boolean,
  imageCallback: (url: string) => string
): {
  attributes: MdxJsxAttribute[]
  children: Md.BlockContent[]
  useDirective: boolean
  directiveType: string
}
export function stringifyProps(
  element: Plate.MdxBlockElement | Plate.MdxInlineElement,
  parentField: RichTextField,
  flatten: boolean,
  imageCallback: (url: string) => string
): {
  attributes: MdxJsxAttribute[]
  children: Md.BlockContent[] | Md.PhrasingContent[]
  useDirective: boolean
  directiveType: string
} {
  const attributes: MdxJsxAttribute[] = []
  const children: Md.Content[] = []
  let template: RichTextTemplate<false> | undefined | string
  let useDirective = false
  let directiveType = 'leaf'
  template = parentField.templates?.find((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates not supported')
    }
    return template.name === element.name
  })
  if (!template) {
    template = parentField.templates?.find((template) => {
      const templateName = template?.match?.name
      return templateName === element.name
    })
  }
  if (!template || typeof template === 'string') {
    throw new Error(`Unable to find template for JSX element ${element.name}`)
  }
  if (template.fields.find((f) => f.name === 'children')) {
    directiveType = 'block'
  }
  useDirective = !!template.match
  Object.entries(element.props).forEach(([name, value]) => {
    if (typeof template === 'string') {
      throw new Error(`Unable to find template for JSX element ${name}`)
    }
    const field = template?.fields?.find((field) => field.name === name)
    if (!field) {
      if (name === 'children') {
        return
      }
      return
      // throw new Error(`No field definition found for property ${name}`)
    }
    switch (field.type) {
      case 'reference':
        if (field.list) {
          if (Array.isArray(value)) {
            attributes.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `[${value.map((item) => `"${item}"`).join(', ')}]`,
              },
            })
          }
        } else {
          if (typeof value === 'string') {
            attributes.push({
              type: 'mdxJsxAttribute',
              name,
              value: value,
            })
          }
        }
        break
      case 'datetime':
      case 'string':
        if (field.list) {
          if (Array.isArray(value)) {
            attributes.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `[${value.map((item) => `"${item}"`).join(', ')}]`,
              },
            })
          }
        } else {
          if (typeof value === 'string') {
            attributes.push({
              type: 'mdxJsxAttribute',
              name,
              value: value,
            })
          } else {
            throw new Error(
              `Expected string for attribute on field ${field.name}`
            )
          }
        }
        break
      case 'image':
        if (field.list) {
          if (Array.isArray(value)) {
            attributes.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `[${value
                  .map((item) => `"${imageCallback(item)}"`)
                  .join(', ')}]`,
              },
            })
          }
        } else {
          attributes.push({
            type: 'mdxJsxAttribute',
            name,
            value: imageCallback(String(value)),
          })
        }
        break
      case 'number':
      case 'boolean':
        if (field.list) {
          if (Array.isArray(value)) {
            attributes.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `[${value.map((item) => `${item}`).join(', ')}]`,
              },
            })
          }
        } else {
          attributes.push({
            type: 'mdxJsxAttribute',
            name,
            value: {
              type: 'mdxJsxAttributeValueExpression',
              value: String(value),
            },
          })
        }
        break
      case 'object':
        attributes.push({
          type: 'mdxJsxAttribute',
          name,
          value: {
            type: 'mdxJsxAttributeValueExpression',
            value: stringifyObj(value, flatten),
          },
        })
        break
      case 'rich-text':
        if (typeof value === 'string') {
          throw new Error(
            `Unexpected string for rich-text, ensure the value has been properly parsed`
          )
        }
        if (field.list) {
          throw new Error(`Rich-text list is not supported`)
        } else {
          const joiner = flatten ? ' ' : '\n'
          let val = ''
          assertShape<Plate.RootElement>(
            value,
            (value) => value.type === 'root' && Array.isArray(value.children),
            `Nested rich-text element is not a valid shape for field ${field.name}`
          )
          if (field.name === 'children') {
            const root = rootElement(value, field, imageCallback)
            root.children.forEach((child) => {
              children.push(child)
            })
            return
          } else {
            const stringValue = stringifyMDX(value, field, imageCallback)
            if (stringValue) {
              val = stringValue
                .trim()
                .split('\n')
                .map((str) => `  ${str.trim()}`)
                .join(joiner)
            }
          }
          if (flatten) {
            attributes.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `<>${val.trim()}</>`,
              },
            })
          } else {
            attributes.push({
              type: 'mdxJsxAttribute',
              name,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `<>\n${val}\n</>`,
              },
            })
          }
        }
        break
      default:
        // @ts-expect-error error type is never
        throw new Error(`Stringify props: ${field.type} not yet supported`)
    }
  })
  if (template.match) {
    // consistent mdx element rendering regardless of children makes it easier to parse
    return {
      useDirective,
      directiveType,
      attributes,
      children:
        children && children.length
          ? (children as any)
          : [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    value: '',
                  },
                ],
              },
            ],
    }
  }

  return { attributes, children, useDirective, directiveType } as any
}

/**
 * Use prettier to determine how to format potentially large objects as strings
 */
function stringifyObj(obj: unknown, flatten: boolean) {
  if (typeof obj === 'object' && obj !== null) {
    const dummyFunc = `const dummyFunc = `
    const res = prettier
      .format(`${dummyFunc}${JSON.stringify(obj)}`, {
        parser: 'acorn',
        trailingComma: 'none',
        semi: false,
        plugins: [parser],
      })
      .trim()
      .replace(dummyFunc, '')
    return flatten ? res.replaceAll('\n', '').replaceAll('  ', ' ') : res
  } else {
    throw new Error(
      `stringifyObj must be passed an object or an array of objects, received ${typeof obj}`
    )
  }
}

export function assertShape<T>(
  value: unknown,
  callback: (item: any) => boolean,
  errorMessage?: string
): asserts value is T {
  if (!callback(value)) {
    throw new Error(errorMessage || `Failed to assert shape`)
  }
}
