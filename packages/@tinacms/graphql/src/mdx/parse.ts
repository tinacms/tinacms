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

import { unified } from 'unified'
import markdown from 'remark-parse'
import mdx from 'remark-mdx'
import { TinaField } from '..'
import type { Content } from 'mdast'
import { visit } from 'unist-util-visit'
import type { GraphQLConfig, RichTypeInner } from '../types'
import type { TinaCloudSchemaEnriched } from '@tinacms/schema-tools'
import { isNull } from 'lodash'
import { resolveMediaRelativeToCloud } from '../resolver/media-utils'

export const parseMDX = (
  value: string,
  field: RichTypeInner,
  graphQLconfig: GraphQLConfig,
  schema: TinaCloudSchemaEnriched
) => {
  const tree = unified().use(markdown).use(mdx).parse(value)
  return parseMDXInner(tree, field, graphQLconfig, schema)
}
/**
 * ### Convert the MDXAST into an API-friendly format
 *
 * When we parse with Remark + MDX we get an AST which has a ton of JS capabilities, meaning
 * we could pass this back into a JS runtime and evaluate it. Ex.
 *
 * ```mdx
 * ## Hello world! The time and date is: {(new Date().toLocaleString())}
 * ```
 *
 * However, as an intentional constraint we don't want this information as part of our API, as
 * we don't intend to support the true JS runtime properties of MDX. Rather, we're using MDX for
 * it's expressive syntax and it's advanced tooling with how it parses JSX inside Markdown.
 *
 * Parsing here does 2 things:
 *
 * #### Remove non-literal uses of JSX
 * Things like <MyComponent myProp={() => alert("HI")} /> are not supported and will be ignored
 *
 * #### Convert remark nodes to slate-compatible nodes
 *
 * A remark node might look like this:
 * ```js
 * {
 *   type: "heading",
 *   depth: 1
 *   children: [{type: 'text', value: 'Hello'}]
 * }
 * ```
 * A slate-compatible node would be:
 * ```js
 * {
 *   type: "heading_one",
 *   children: [{type: 'text', text: 'Hello'}]
 * }
 * ```
 * It's not a huge difference, but in general slate does better with less layers of indirection.
 *
 * While it may be desirable to ultimately serve a remark AST shape as part of the API response,
 * it's currently much easier to only support the shape that works with Slate. This is ok for now for 2
 * reasons.
 *
 * 1. Us providing the `TinaMarkdown` component on the frontend abstracts away an work the developer
 * would need to do, so it doesn't really matter what shape the response is as long as the external API
 * doesn't change
 *
 * 2. We don't need to do any client-side parsing. Since TinaMarkdown and the slate editor work with the same
 * format we can just allow Tina to do it's thing and update the form valuse with no additional work.
 */
export const parseMDXInner = (
  tree: any,
  field: RichTypeInner,
  graphQLconfig: GraphQLConfig,
  schema: TinaCloudSchemaEnriched
) => {
  // Delete useless position info
  visit(tree, (node) => {
    delete node.position
  })
  visit(tree, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node) => {
    let props = {}
    if (!node.name) {
      props = parseMDXInner(
        { type: 'root', children: node.children },
        field,
        graphQLconfig,
        schema
      )
    }
    const template = field.templates?.find((template) => {
      const templateName =
        typeof template === 'string' ? template : template.name
      return templateName === node.name
    })
    if (!template) {
      if (isNull(node.name)) {
        // this is a fragment <> </>, ignore it
      } else {
        throw new Error(
          `Found unregistered JSX or HTML: <${node.name}>. Please ensure all structured elements have been registered with your schema. https://tina.io/docs/editing/mdx/`
        )
      }
    }

    if (node.children.length > 0) {
      node.attributes.push({
        value: node.children,
        name: 'children',
        type: 'mdxJsxAttribute',
      })
    }
    node.children = null
    node.attributes.forEach((attribute) => {
      if (attribute.type === 'mdxJsxAttribute') {
        if (typeof template === 'string') {
          throw new Error('Global templates not yet supported')
        }
        if (!template) {
        } else {
          const field = template.fields.find(
            (field) => field.name === attribute.name
          )
          if (!field) {
            // FIXME: should probably allow these to pass through untouched
            throw new Error(
              `Unknown property '${attribute.name}' for embedded structure '${node.name}'`
            )
          }

          parseField(attribute, field, props, graphQLconfig, schema)
        }
      } else {
        console.log(`Not sure what this is, type: ${attribute.type}`)
      }
    })
    delete node.attributes
    node.props = props
  })

  const slateTree = tree.children.map((node) =>
    remarkToSlate(node, graphQLconfig, schema)
  )
  return { type: 'root', children: slateTree }
}

const parseField = (
  attribute,
  field: TinaField,
  props,
  graphQLconfig: GraphQLConfig,
  schema: TinaCloudSchemaEnriched
) => {
  switch (field.type) {
    case 'boolean':
    case 'datetime':
      props[field.name] = attribute.value
      break
    case 'image':
      props[field.name] = resolveMediaRelativeToCloud(
        attribute.value,
        graphQLconfig,
        schema
      )
      break
    case 'number':
    case 'string':
      if (field.list) {
        // Must be an expression of literals
        if (attribute.value?.type === 'mdxJsxAttributeValueExpression') {
          attribute.value.data.estree.body.forEach((item) => {
            if (item.type === 'ExpressionStatement') {
              if (item.expression.type === 'ArrayExpression') {
                props[field.name] = item.expression.elements.map((element) => {
                  if (element.type === 'Literal') {
                    return element.value
                  } else {
                    throw new Error(
                      `Only literals are supported for array expressions`
                    )
                  }
                })
              }
            }
          })
        }
      } else {
        if (attribute.type === 'Property') {
          if (attribute.value.type === 'Literal') {
            /**
             * Attribute:
             * ```js
             * {
             *   type: "Property",
             *   value: {
             *     type: "Literal",
             *     value: "Some string"
             *   }
             * }
             * ```
             */
            props[attribute.key.name] = attribute.value.value
          }
        } else if (attribute.value?.type === 'mdxJsxAttributeValueExpression') {
          // can be an expression (of a single literal) or just a literal
          // name={"Hello"} or name="hello"
          attribute.value.data.estree.body.forEach((item) => {
            if (item.type === 'ExpressionStatement') {
              // Only literals are accepted
              if (item.expression.type === 'Literal') {
                props[field.name] = item.expression.value
              }
              if (item.expression.type === 'ArrayExpression') {
                throw new Error(
                  `Unexpected array expression for non-list field ${field.name}`
                )
              }
              if (item.expression.type === 'TemplateLiteral') {
                // eg. <MyComp name={`Hello`} />
                throw new Error(`Template literals are not yet supported`)
              }
            }
          })
        } else {
          props[field.name] = attribute.value
        }
      }
      break
    case 'object':
      if (attribute.type === 'mdxJsxAttribute') {
        if (attribute.value.type === 'mdxJsxAttributeValueExpression') {
          // console.log(JSON.stringify(attribute.value, null, 2))
          attribute.value.data.estree.body.forEach((item) => {
            if (item.type === 'ExpressionStatement') {
              // Only literals are accepted
              if (item.expression.type === 'ObjectExpression') {
                const objectProps = {}
                item.expression.properties.forEach((property) => {
                  if (property.key.type !== 'Identifier') {
                    throw new Error(`Unexptected key type ${property.key.type}`)
                  }
                  if (property.value.type !== 'Literal') {
                    throw new Error(
                      `Unexptected value type ${property.value.type}`
                    )
                  }
                  // TODO: support templates when single object templates are supported
                  if (field.fields) {
                    if (typeof field.fields === 'string') {
                      throw new Error(
                        `Global fields not supported at this time`
                      )
                    }
                    field.fields.forEach((field) => {
                      parseField(
                        property,
                        field,
                        objectProps,
                        graphQLconfig,
                        schema
                      )
                    })
                  }
                })
                props[field.name] = objectProps
              } else if (item.expression.type === 'ArrayExpression') {
                const objectArrayProps = []
                item.expression.elements.forEach((element) => {
                  if (element.type === 'ObjectExpression') {
                    const objectProps = {}
                    element.properties.forEach((property) => {
                      if (property.key.type !== 'Identifier') {
                        throw new Error(
                          `Unexptected key type ${property.key.type}`
                        )
                      }
                      if (property.value.type !== 'Literal') {
                        throw new Error(
                          `Unexptected value type ${property.value.type}`
                        )
                      }
                      // objectProps[property.key.name] = property.value.value
                      if (field.fields) {
                        if (typeof field.fields === 'string') {
                          throw new Error(
                            `Global fields not supported at this time`
                          )
                        }
                        field.fields.forEach((field) => {
                          parseField(
                            property,
                            field,
                            objectProps,
                            graphQLconfig,
                            schema
                          )
                        })
                      }
                      if (field.templates) {
                        field.templates.forEach((fieldTemplate) => {
                          if (typeof fieldTemplate === 'string') {
                            throw new Error(
                              `Global fields not supported at this time`
                            )
                          }
                          fieldTemplate.fields.forEach((field) => {
                            parseField(
                              property,
                              field,
                              objectProps,
                              graphQLconfig,
                              schema
                            )
                          })
                        })
                      }
                    })
                    objectArrayProps.push(objectProps)
                  } else {
                    throw new Error(
                      `Unexpected expression type ${element.type}`
                    )
                  }
                  props[field.name] = objectArrayProps
                })
              } else {
                throw new Error('Only object expressions are supported')
              }
            }
          })
        }
      }
      break

    case 'rich-text':
      if (attribute.value) {
        /**
         * this is MDX as a children prop, meaning it doesn't have fragment wrappers (<>Some MDX</>)
         * <Hero>
         *   # This is MDX in the children prop
         * </Hero>
         */
        if (field.name === 'children') {
          if (Array.isArray(attribute.value)) {
            // console.log(field.name)
            props[field.name] = parseMDXInner(
              { type: 'root', children: attribute.value },
              field,
              graphQLconfig,
              schema
            )
          } else {
            throw Error(
              `Expected an array of MDX strings for rich-text field with the special name 'children'`
            )
          }
        } else {
          /**
           * this is MDX as a non-children prop, it has fragment wrappers, so we need
           * to dig down to the first child and grab its props, since that's effectively the MDX we actually care about:
           *
           * <Hero
           *  subHeader={<>
           *    # This is MDX in a non-children prop    <---- this is the part we actually care about
           *  </>}
           * />
           */
          try {
            const mdx = parseMDX(
              attribute.value.value,
              field,
              graphQLconfig,
              schema
            )
            props[field.name] = mdx.children[0].props
          } catch (e) {
            console.log(e)
          }
        }
      } else {
        console.log('nothing', field.name, mdx)
      }
      break
  }
}
export interface NodeTypes {
  paragraph: string
  block_quote: string
  code_block: string
  link: string
  image: string
  ul_list: string
  ol_list: string
  listItem: string
  heading: {
    1: string
    2: string
    3: string
    4: string
    5: string
    6: string
  }
  emphasis_mark: string
  strong_mark: string
  delete_mark: string
  inline_code_mark: string
  thematic_break: string
  break: string
}

export type SlateNodeType =
  | {
      type: 'heading_one'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_two'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_three'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_four'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_five'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_six'
      children: SlateNodeType[]
    }
  | {
      type: 'paragraph'
      children: SlateNodeType[]
    }
  | {
      children: SlateNodeType[]
      link: string
      type: 'link'
    }
  | {
      type: 'block_quote'
      children: SlateNodeType[]
    }
  | {
      type: 'text'
      text: string
    }
  | {
      type: 'mdxJsxTextElement'
      props: object
      children: SlateNodeType[]
      name: string
    }
  | {
      type: 'mdxJsxFlowElement'
      props: object
      children: SlateNodeType[]
      name: string
    }
  | {
      type: 'block_quote'
      children: SlateNodeType[]
    }
  | {
      type: 'code_block'
      language: string
      value: string
    }
  | {
      type: 'image'
      link: string
      caption: string
    }
  | {
      type: 'thematic_break'
    }
//   block_quote: 'block_quote',
//   code_block: 'code_block',
//   link: 'link',
//   ul_list: 'ul_list',
//   ol_list: 'ol_list',
//   listItem: 'list_item',
//   heading: {
//     1: 'heading_one',
//     2: 'heading_two',
//     3: 'heading_three',
//     4: 'heading_four',
//     5: 'heading_five',
//     6: 'heading_six',
//   },
//   emphasis_mark: 'italic',
//   strong_mark: 'bold',
//   delete_mark: 'strikeThrough',
//   inline_code_mark: 'code',
//   thematic_break: 'thematic_break',
//   image: 'image',
// }

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

export interface OptionType {
  nodeTypes?: RecursivePartial<NodeTypes>
  linkDestinationKey?: string
  imageSourceKey?: string
  imageCaptionKey?: string
}

export interface MdastNode {
  type?: string
  ordered?: boolean
  value?: string
  text?: string
  children?: Array<MdastNode>
  depth?: 1 | 2 | 3 | 4 | 5 | 6
  url?: string
  alt?: string
  lang?: string
  // mdast metadata
  position?: any
  spread?: any
  checked?: any
  indent?: any
}

type MdxJsxFlowElement = {
  type: 'mdxJsxFlowElement'
  name: string
  attributes: object
  children: MdxAstNode[]
}

type MdxJsxTextElement = {
  type: 'mdxJsxTextElement'
  name: string
  attributes: object
  children: MdxAstNode[]
}

type MdxAstNode = Content | MdxJsxFlowElement | MdxJsxTextElement

export const plateElements = {
  ELEMENT_H1: 'h1',
  ELEMENT_H2: 'h2',
  ELEMENT_H3: 'h3',
  ELEMENT_H4: 'h4',
  ELEMENT_H5: 'h5',
  ELEMENT_H6: 'h6',
  ELEMENT_HR: 'hr',
  ELEMENT_ALIGN_CENTER: 'align_center',
  ELEMENT_ALIGN_JUSTIFY: 'align_justify',
  ELEMENT_ALIGN_LEFT: 'align_left',
  ELEMENT_ALIGN_RIGHT: 'align_right',
  ELEMENT_BLOCKQUOTE: 'blockquote',
  ELEMENT_CODE_BLOCK: 'code_block',
  // ELEMENT_CODE_LINE: 'code_line',
  ELEMENT_CODE_LINE: 'code',
  ELEMENT_DEFAULT: 'p',
  ELEMENT_IMAGE: 'img',
  ELEMENT_LI: 'li',
  ELEMENT_LIC: 'lic',
  ELEMENT_LINK: 'a',
  ELEMENT_MEDIA_EMBED: 'media_embed',
  ELEMENT_MENTION: 'mention',
  ELEMENT_OL: 'ol',
  ELEMENT_PARAGRAPH: 'p',
  ELEMENT_TABLE: 'table',
  ELEMENT_TD: 'td',
  ELEMENT_TH: 'th',
  ELEMENT_TODO_LI: 'action_item',
  ELEMENT_TR: 'tr',
  ELEMENT_UL: 'ul',
  MARK_ITALIC: 'italic',
  MARK_BOLD: 'bold',
  MARK_STRIKETHROUGH: 'strikethrough',
  MARK_UNDERLINE: 'underline',
}

export const defaultNodeTypes: NodeTypes = {
  paragraph: plateElements.ELEMENT_PARAGRAPH,
  block_quote: plateElements.ELEMENT_BLOCKQUOTE,
  code_block: plateElements.ELEMENT_CODE_BLOCK,
  link: plateElements.ELEMENT_LINK,
  ul_list: plateElements.ELEMENT_UL,
  ol_list: plateElements.ELEMENT_OL,
  listItem: plateElements.ELEMENT_LI,
  heading: {
    1: plateElements.ELEMENT_H1,
    2: plateElements.ELEMENT_H2,
    3: plateElements.ELEMENT_H3,
    4: plateElements.ELEMENT_H4,
    5: plateElements.ELEMENT_H5,
    6: plateElements.ELEMENT_H6,
  },
  emphasis_mark: plateElements.MARK_ITALIC,
  strong_mark: plateElements.MARK_BOLD,
  delete_mark: plateElements.MARK_STRIKETHROUGH,
  inline_code_mark: plateElements.ELEMENT_CODE_LINE,
  thematic_break: plateElements.ELEMENT_HR,
  break: 'break',
  image: plateElements.ELEMENT_IMAGE,
}

export default function remarkToSlate(
  node: MdxAstNode,
  graphQLconfig: GraphQLConfig,
  schema: TinaCloudSchemaEnriched
) {
  const types = {
    ...defaultNodeTypes,
    heading: {
      ...defaultNodeTypes.heading,
    },
  }

  switch (node.type) {
    case 'heading':
      return {
        type: types.heading[node.depth],
        children: node.children.map((node) =>
          remarkToSlate(node, graphQLconfig, schema)
        ),
      }
    case 'list':
      return {
        type: node.ordered ? types.ol_list : types.ul_list,
        children: node.children.map((node) =>
          remarkToSlate(node, graphQLconfig, schema)
        ),
      }
    case 'listItem':
      const realChildren = []
      node.children.forEach((child) => {
        if (child.type === 'list') {
          realChildren.push({
            type: child.ordered ? types.ol_list : types.ul_list,
            children: child.children.map((node) =>
              remarkToSlate(node, graphQLconfig, schema)
            ),
          })
        } else {
          realChildren.push({
            type: plateElements.ELEMENT_LIC,
            // @ts-ignore FIXME: MDAST types don't match with some of these
            children: child.children.map((node) =>
              remarkToSlate(node, graphQLconfig, schema)
            ),
          })
        }
      })
      return {
        type: types.listItem,
        children: realChildren,
      }
    case 'paragraph':
      return {
        type: types.paragraph,
        children: node.children.map((node) =>
          remarkToSlate(node, graphQLconfig, schema)
        ),
      }
    case 'link':
      return {
        type: types.link,
        url: node.url,
        children: node.children.map((node) =>
          remarkToSlate(node, graphQLconfig, schema)
        ),
      }
    case 'image':
      const url = resolveMediaRelativeToCloud(node.url, graphQLconfig, schema)
      return {
        type: types.image,
        url: url,
        alt: node.alt,
        caption: node.title,
      }
    case 'blockquote':
      return {
        type: types.block_quote,
        children: node.children.map((node) =>
          remarkToSlate(node, graphQLconfig, schema)
        ),
      }
    case 'code':
      return {
        type: types.code_block,
        lang: node.lang,
        children: node.value.split('\n').map((item) => ({
          type: 'code_line',
          children: [{ type: 'text', text: item }],
        })),
      }

    // case 'html':
    //   if (node.value?.includes('<br>')) {
    //     return {
    //       break: true,
    //       type: types.paragraph,
    //       children: [{ text: node.value?.replace(/<br>/g, '') || '' }],
    //     }
    //   }
    //   return { type: 'paragraph', children: [{ text: node.value || '' }] }

    case 'emphasis':
      return {
        [types.emphasis_mark]: true,
        ...forceLeafNode(node.children),
        ...persistLeafFormats(node.children),
      }
    case 'strong':
      return {
        [types.strong_mark]: true,
        ...forceLeafNode(node.children),
        ...persistLeafFormats(node.children),
      }
    case 'delete':
      return {
        [types.delete_mark]: true,
        ...forceLeafNode(node.children),
        ...persistLeafFormats(node.children),
      }
    case 'inlineCode':
      return {
        [types.inline_code_mark]: true,
        text: node.value,
      }
    case 'thematicBreak':
      return {
        type: types.thematic_break,
        children: [{ type: 'text', text: '' }],
      }
    case 'text':
      return { type: 'text', text: node.value || '' }
    case 'mdxJsxFlowElement':
    case 'mdxJsxTextElement':
      return {
        ...node,
        children: undefined,
      }
    case 'break':
      return { type: types.break, children: [{ type: 'text', text: '' }] }
    default:
      console.log('unknown', node)
      return { type: 'text', text: '' }
  }
}

const forceLeafNode = (children: Array<MdxAstNode>) => {
  const extraProps = {}
  const text = []

  children.forEach((k) => {
    switch (k.type) {
      case 'inlineCode':
      case 'text':
        return text.push(k.value || '')
      case 'strong':
      case 'emphasis':
        const format = { strong: 'bold', em: 'italic', code: 'code' }
        extraProps[format[k.type]] = true
        return k.children.forEach((item) => {
          //@ts-ignore FIXME: Property 'children' does not exist on type 'Code | Emphasis | Strong'
          text.push(item.value)
        })
      default:
        throw new Error(`Not sure, this should be flattened to the same node`)
    }
  })

  return {
    type: 'text',
    text: text.join(''),
    ...extraProps,
  }
}

// This function is will take any unknown keys, and bring them up a level
// allowing leaf nodes to have many different formats at once
// for example, bold and italic on the same node
function persistLeafFormats(children: Array<MdxAstNode>) {
  return children.reduce((acc, node) => {
    Object.keys(node).forEach(function (key) {
      if (key === 'children' || key === 'type' || key === 'text') return

      // @ts-ignore
      acc[key] = node[key]
    })

    return acc
  }, {})
}
