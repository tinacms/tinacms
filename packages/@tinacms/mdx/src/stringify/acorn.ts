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
import { format } from 'prettier'
import type { RichTypeInner } from '@tinacms/schema-tools'
import type { MdxJsxAttribute } from 'mdast-util-mdx-jsx'
import * as Plate from '../parse/plate'
import type * as Md from 'mdast'
import { rootElement, stringifyMDX } from '.'

export const stringifyPropsInline = (
  element: Plate.MdxInlineElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
): { attributes: MdxJsxAttribute[]; children: Md.PhrasingContent[] } => {
  return stringifyProps(element, field, true, imageCallback)
}
export function stringifyProps(
  element: Plate.MdxInlineElement,
  parentField: RichTypeInner,
  flatten: boolean,
  imageCallback: (url: string) => string
): { attributes: MdxJsxAttribute[]; children: Md.PhrasingContent[] }
export function stringifyProps(
  element: Plate.MdxBlockElement,
  parentField: RichTypeInner,
  flatten: boolean,
  imageCallback: (url: string) => string
): { attributes: MdxJsxAttribute[]; children: Md.BlockContent[] }
export function stringifyProps(
  element: Plate.MdxBlockElement | Plate.MdxInlineElement,
  parentField: RichTypeInner,
  flatten: boolean,
  imageCallback: (url: string) => string
): {
  attributes: MdxJsxAttribute[]
  children: Md.BlockContent[] | Md.PhrasingContent[]
} {
  const attributes: MdxJsxAttribute[] = []
  const children: Md.Content[] = []
  const template = parentField.templates?.find((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates not supported')
    }
    return template.name === element.name
  })
  if (!template || typeof template === 'string') {
    throw new Error(`Unable to find template for JSX element ${element.name}`)
  }
  Object.entries(element.props).forEach(([name, value]) => {
    const field = template.fields.find((field) => field.name === name)
    if (!field) {
      if (name === 'children') {
        return
      }
      throw new Error(`No field definition found for property ${name}`)
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
    if (attributes[0] && typeof attributes[0].value === 'string') {
      return {
        attributes: [],
        children: [{ type: 'inlineCode', value: attributes[0].value }],
      }
    }
  }
  return { attributes, children } as any
}

/**
 * Use prettier to determine how to format potentially large objects as strings
 */
function stringifyObj(obj: unknown, flatten: boolean) {
  if (typeof obj === 'object' && obj !== null) {
    const dummyFunc = `const dummyFunc = `
    const res = format(`${dummyFunc}${JSON.stringify(obj)}`, {
      parser: 'acorn',
      trailingComma: 'none',
      semi: false,
    })
      .trim()
      .replace(dummyFunc, '')
    return flatten ? res.replaceAll('\n', '').replaceAll('  ', ' ') : res
  } else {
    console.log(obj)
    throw new Error(
      `stringifyObj must be passed an object or an array of objects, received ${typeof obj}`
    )
  }
}

export function assertShape<T extends unknown>(
  value: unknown,
  callback: (item: any) => boolean,
  errorMessage?: string
): asserts value is T {
  if (!callback(value)) {
    throw new Error(errorMessage || `Failed to assert shape`)
  }
}
