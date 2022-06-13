// @ts-nocheck FIXME: plate elements and SlateNodeType needs to be merged
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
import type { GraphQLConfig, RichTypeInner } from '../types'
import type { TinaCloudSchemaEnriched } from '@tinacms/schema-tools'
import { SlateNodeType, plateElements } from './parse'
import type { Content, PhrasingContent } from 'mdast'
import { resolveMediaCloudToRelative } from '../resolver/media-utils'

export const stringifyMDX = (
  value: unknown,
  field: RichTypeInner,
  graphQLconfig: GraphQLConfig,
  schema: TinaCloudSchemaEnriched
) => {
  // @ts-ignore: FIXME: validate this shape
  const slateTree: SlateNodeType[] = value.children
  try {
    const tree = stringifyChildren(slateTree, field, graphQLconfig, schema)
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

const allChildrenEmpty = (children: any[]) => {
  if (children.every((child) => child.type === 'text' && !child.value)) {
    return true
  }
  return false
}

const stringifyChildren = (
  children: any[],
  field,
  graphQLconfig: GraphQLConfig,
  schema: TinaCloudSchemaEnriched
) => {
  if (!children) {
    return []
  }
  return (
    children
      .map((child) => stringify(child, field, graphQLconfig, schema))
      // This allows us to return `false` when we want a node to be removed entirely
      .filter(Boolean) as PhrasingContent[]
  )
}

export const stringify = (
  node: { type: typeof plateElements },
  field: RichTypeInner,
  graphQLconfig: GraphQLConfig,
  schema: TinaCloudSchemaEnriched
): Content => {
  if (!node.type) {
    // Inline code cannot have other marks like bold and emphasis
    if (node?.code) {
      return {
        type: 'inlineCode',
        value: node.text,
      }
    }
    let returnNode: Content = { type: 'text', value: node.text || '' }
    if (node?.bold) {
      returnNode = { type: 'strong', children: [returnNode] }
    }
    if (node?.italic) {
      returnNode = {
        type: 'emphasis',
        children: [returnNode],
      }
    }
    return returnNode
  }

  switch (node.type) {
    case plateElements.ELEMENT_H1:
      return {
        type: 'heading',
        depth: 1,
        children: stringifyChildren(
          node.children,
          field,
          graphQLconfig,
          schema
        ),
      }
    case plateElements.ELEMENT_H2:
      return {
        type: 'heading',
        depth: 2,
        children: stringifyChildren(
          node.children,
          field,
          graphQLconfig,
          schema
        ),
      }
    case plateElements.ELEMENT_H3:
      return {
        type: 'heading',
        depth: 3,
        children: stringifyChildren(
          node.children,
          field,
          graphQLconfig,
          schema
        ),
      }
    case plateElements.ELEMENT_H4:
      return {
        type: 'heading',
        depth: 4,
        children: stringifyChildren(
          node.children,
          field,
          graphQLconfig,
          schema
        ),
      }
    case plateElements.ELEMENT_H5:
      return {
        type: 'heading',
        depth: 5,
        children: stringifyChildren(
          node.children,
          field,
          graphQLconfig,
          schema
        ),
      }
    case plateElements.ELEMENT_H6:
      return {
        type: 'heading',
        depth: 6,
        children: stringifyChildren(
          node.children,
          field,
          graphQLconfig,
          schema
        ),
      }
    case plateElements.ELEMENT_PARAGRAPH:
      const children = stringifyChildren(
        node.children,
        field,
        graphQLconfig,
        schema
      )
      if (allChildrenEmpty(children)) {
        return false
      }
      return {
        type: 'paragraph',
        children,
      }
    case plateElements.ELEMENT_CODE_BLOCK:
      return {
        type: 'code',
        lang: node.lang,
        value: node.children.map((child) => child.children[0].text).join('\n'),
      }
    case plateElements.ELEMENT_UL:
      return {
        type: 'list',
        ordered: false,
        spread: false,
        check: null,
        children: stringifyChildren(
          node.children,
          field,
          graphQLconfig,
          schema
        ),
      }
    case plateElements.ELEMENT_OL:
      return {
        type: 'list',
        ordered: true,
        spread: false,
        check: null,
        children: stringifyChildren(
          node.children,
          field,
          graphQLconfig,
          schema
        ),
      }
    case plateElements.ELEMENT_LI:
      const realChildren = []
      const extraChildren = []
      node.children.forEach((child) => {
        child.children.forEach((c) => {
          if (c.type === 'li') {
            extraChildren.push(c)
          } else {
            realChildren.push(c)
          }
        })
      })
      const p = {
        type: 'p',
        children: realChildren,
      }
      return {
        type: 'listItem',
        spread: false,
        check: null,
        children: [
          ...stringifyChildren([p], field, graphQLconfig, schema),
          ...stringifyChildren(extraChildren, field, graphQLconfig, schema),
        ],
      }
    case plateElements.ELEMENT_LIC:
      return {
        type: 'paragraph',
        children: stringifyChildren(
          node.children,
          field,
          graphQLconfig,
          schema
        ),
      }
    case plateElements.ELEMENT_IMAGE:
      const url = resolveMediaCloudToRelative(node.url, graphQLconfig, schema)
      return {
        type: 'image',
        title: node.caption,
        alt: node.alt,
        url: url,
      }
    case plateElements.ELEMENT_HR:
      return {
        type: 'thematicBreak',
      }
    case plateElements.ELEMENT_LINK:
      return {
        type: 'link',
        url: node.url,
        title: node.title,
        children: stringifyChildren(
          node.children,
          field,
          graphQLconfig,
          schema
        ),
      }
    case plateElements.ELEMENT_BLOCKQUOTE:
      return {
        type: 'blockquote',
        children: stringifyChildren(
          node.children,
          field,
          graphQLconfig,
          schema
        ),
      }
    case 'mdxJsxTextElement':
    case 'mdxJsxFlowElement':
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
                      const innerValue = {}
                      if (typeof field.fields === 'string') {
                        throw new Error(
                          `Global templates not yet supported for rich text`
                        )
                      }
                      field.fields.forEach((innerField) => {
                        const fieldValue = item[innerField.name]
                        if (fieldValue) {
                          switch (innerField.type) {
                            case 'boolean':
                            case 'number':
                              innerValue[innerField.name] = `${fieldValue}`
                              break
                            case 'image':
                            case 'datetime':
                            case 'string':
                              innerValue[innerField.name] = `"${fieldValue}"`
                              break
                          }
                        }
                      })
                      // Only add it if it's not empty
                      if (Object.entries(innerValue).length > 0) {
                        values.push(innerValue)
                      }
                    } else {
                      value.forEach((item) => {
                        const template = field.templates.find((template) => {
                          const templateName =
                            typeof template === 'string'
                              ? template
                              : template.name
                          return templateName === item._template
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
                            v['_template'] = `"${template.name}"`
                            // console.log(v)
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
                const tree = stringifyChildren(
                  value.children,
                  field,
                  graphQLconfig,
                  schema
                )
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

    case 'break':
      return {
        type: 'break',
      }
    case 'text':
      // Inline code cannot have other marks like bold and emphasis
      if (node?.code) {
        return {
          type: 'inlineCode',
          value: node.text,
        }
      }
      let returnNode: Content = { type: 'text', value: node.text || '' }

      if (node?.bold) {
        returnNode = { type: 'strong', children: [returnNode] }
      }
      if (node?.italic) {
        returnNode = {
          type: 'emphasis',
          children: [returnNode],
        }
      }
      return returnNode

    default:
      console.log(`Unrecognized field type: ${node.type}`)
      break
  }
  return { type: 'text', value: '' }
}
