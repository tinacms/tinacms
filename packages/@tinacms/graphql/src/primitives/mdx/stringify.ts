// @ts-nocheck
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

import { toMarkdown } from 'mdast-util-to-markdown'
import { mdxToMarkdown } from 'mdast-util-mdx'
import type { RichTypeInner } from '../types'
import { SlateNodeType, plateElements } from './parse'
import type { Content, PhrasingContent, StaticPhrasingContent } from 'mdast'

export const stringifyMDX = (value: unknown, field: RichTypeInner) => {
  // @ts-ignore: FIXME: validate this shape
  const slateTree: SlateNodeType[] = value.children
  try {
    const tree = slateTree.map((item) => stringify(item, field))
    const out = toMarkdown(
      {
        type: 'root',
        // @ts-ignore
        children: tree,
      },
      {
        extensions: [mdxToMarkdown],
      }
    )
    return out.replace(/&#x22;/g, `"`)
  } catch (e) {
    console.log(e)
  }
}

export const stringify = (
  node: { type: typeof plateElements },
  field: RichTypeInner
): Content => {
  if (!node.type) {
    return {
      type: 'text',
      // @ts-ignore
      value: node.text || '',
    }
  }

  switch (node.type) {
    case plateElements.ELEMENT_H1:
      return {
        type: 'heading',
        depth: 1,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case plateElements.ELEMENT_H2:
      return {
        type: 'heading',
        depth: 2,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case plateElements.ELEMENT_H3:
      return {
        type: 'heading',
        depth: 3,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case plateElements.ELEMENT_H4:
      return {
        type: 'heading',
        depth: 4,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case plateElements.ELEMENT_H5:
      return {
        type: 'heading',
        depth: 5,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case plateElements.ELEMENT_H6:
      return {
        type: 'heading',
        depth: 6,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case plateElements.ELEMENT_PARAGRAPH:
      return {
        type: 'paragraph',
        children: node.children.map((child) =>
          stringify(child, field)
        ) as PhrasingContent[],
      }
    case plateElements.ELEMENT_LINK:
      return {
        type: 'link',
        url: node.link,
        children: node.children.map((child) =>
          stringify(child, field)
        ) as StaticPhrasingContent[],
      }
    case 'mdxJsxTextElement':
    case 'mdxJsxFlowElement':
      if (node.name === 'Cta') {
        console.log(node)
      }
      try {
        let children = []
        const atts = []
        const template = field.templates?.find((fieldTemplate) => {
          if (typeof fieldTemplate === 'string') {
            throw new Error(`Global templates not yet supported`)
          } else {
            return fieldTemplate.name === node.name
          }
        })
        if (typeof template === 'string') {
          throw new Error(`Global templates not yet supported`)
        }
        Object.entries(node.props).map(([key, value]) => {
          if (template.fields) {
            const field = template.fields.find((field) => field.name === key)
            if (!field) {
              throw new Error(`Unknown field for key ${key}`)
            }
            switch (field.type) {
              case 'boolean':
              case 'datetime':
              case 'image':
              case 'number':
              case 'string':
                if (field.list) {
                  const v = {
                    type: 'mdxJsxAttributeValueExpression',
                    value: `[${value.map((item) => {
                      switch (field.type) {
                        case 'boolean':
                        case 'number':
                          return `${item}`
                        case 'image':
                        case 'datetime':
                        case 'string':
                          return `"${item}"`
                      }
                    })}]`,
                  }
                  atts.push({ type: 'mdxJsxAttribute', name: key, value: v })
                } else {
                  atts.push({
                    type: 'mdxJsxAttribute',
                    name: key,
                    value: `${value}`,
                  })
                }
                break

              case 'object':
                if (field.list) {
                  const values = []
                  value.forEach((item) => {
                    if (field.fields) {
                      const v = {}
                      if (typeof field.fields === 'string') {
                        throw new Error(
                          `Global templates not yet supported for rich text`
                        )
                      }
                      field.fields.forEach((field) => {
                        const fieldValue = item[field.name]
                        if (fieldValue) {
                          switch (field.type) {
                            case 'boolean':
                            case 'number':
                              v[field.name] = `${fieldValue}`
                              break
                            case 'image':
                            case 'datetime':
                            case 'string':
                              v[field.name] = `"${fieldValue}"`
                              break
                          }
                        }
                        values.push(v)
                      })
                    } else {
                      value.forEach((item) => {
                        // Only take the first item
                        const [itemTemplateName, itemValues] =
                          Object.entries(item)[0]
                        const template = field.templates.find((template) => {
                          const templateName =
                            typeof template === 'string'
                              ? template
                              : template.name
                          return templateName === itemTemplateName
                        })
                        if (typeof template === 'string') {
                          throw new Error(
                            `Global templates not yet supported for rich text`
                          )
                        }
                        if (!template) {
                          throw new Error(
                            `Unable to find template for field ${field.name}`
                          )
                        }
                        const v = {}
                        template.fields.forEach((field) => {
                          const fieldValue = itemValues[field.name]
                          if (fieldValue) {
                            switch (field.type) {
                              case 'boolean':
                              case 'number':
                                v[field.name] = `${fieldValue}`
                                break
                              case 'image':
                              case 'datetime':
                              case 'string':
                                v[field.name] = `"${fieldValue}"`
                                break
                            }
                            v['_template'] = `"${template.name}"`
                          }
                        })
                        values.push(v)
                      })
                    }
                  })
                  if (values.length > 0) {
                    const ast = {
                      type: 'mdxJsxAttributeValueExpression',
                      name: key,
                      value: {
                        value: `[${values
                          .map((item) => {
                            return `{${Object.entries(item)
                              .map(([key, value]) => {
                                return `${key}: ${value}`
                              })
                              .join(', ')}}`
                          })
                          .join(', ')}]`,
                      },
                    }
                    atts.push({ name: key, ...ast })
                  }
                } else {
                  if (field.fields) {
                    const v = {}
                    if (typeof field.fields === 'string') {
                      throw new Error(
                        `Global templates not yet supported for rich text`
                      )
                    }
                    field.fields.forEach((field) => {
                      const fieldValue = value[field.name]
                      switch (field.type) {
                        case 'boolean':
                        case 'number':
                          v[field.name] = `${fieldValue}`
                          break
                        case 'image':
                        case 'datetime':
                        case 'string':
                          v[field.name] = `"${fieldValue}"`
                          break
                      }
                    })
                    const ast = {
                      type: 'mdxJsxAttributeValueExpression',
                      name: key,
                      value: {
                        value: `{${Object.entries(v)
                          .map(([key, value]) => {
                            return `${key}: ${value}`
                          })
                          .join(', ')}}`,
                      },
                    }
                    atts.push({ name: key, ...ast })
                  } else {
                    throw new Error('Templates not yet')
                  }
                }
                break
              case 'rich-text':
                const tree = value.children
                  .map((item) => stringify(item, field))
                  .filter((item) => {
                    if (item.type === 'text' && !item.text) {
                      return false
                    }

                    return true
                  })
                if (field.name === 'children') {
                  children = tree
                } else {
                  const out = toMarkdown(
                    {
                      type: 'root',
                      children: tree,
                    },
                    { extensions: [mdxToMarkdown] }
                  )
                  if (out) {
                    atts.push({
                      type: 'mdxJsxAttribute',
                      name: key,
                      value: {
                        value: `
<>
${out}
</>
`,
                      },
                    })
                  }
                }
                break
              default:
                atts.push({
                  type: 'mdxJsxAttribute',
                  name: key,
                  value: 'not yet',
                })
                break
            }
          } else {
            throw new Error(`Templates not yet supported`)
          }
        })

        return {
          ...node,
          children: children,
          //@ts-ignore
          attributes: atts,
        }
      } catch (e) {
        console.log(e)
      }

    case 'text':
      return {
        type: 'text',
        // @ts-ignore
        value: node.text || '',
      }
    default:
      console.log(`Unrecognized field type: ${node.type}`)
      break
  }
  return { type: 'text', value: '' }
}
